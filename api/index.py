# H&M E-commerce 5-Category Recommender Engine
import os
import pickle
import sqlite3
import json
import numpy as np
from flask import Flask, jsonify, render_template, request

app = Flask(__name__, template_folder='templates', static_folder='templates')

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

API_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(API_DIR, "fashion_recommender.db")
MAPPINGS_PATH = os.path.join(API_DIR, "reps_biases_mappings.pkl")

# Global loaded assets
biases = None
reps = None
norm_reps = None
item_mapping = None
reverse_item_mapping = None
num_items = 0

# Cache of ALL ASINs surfaced in the survey picker.
# These are excluded from recommendations to guarantee
# that suggested items are completely distinct from picker items.
survey_shown_asins: set = set()

def ensure_image_url(image_url, parent_asin):
    if not image_url or image_url.strip() == "":
        if parent_asin and len(parent_asin) >= 3:
            return f"https://qdrant-nextjs-demo-product-images.s3.us-east-1.amazonaws.com/images/{parent_asin[:3]}/{parent_asin}.jpg"
    return image_url

def build_database(dataset_type):
    print(f"Building SQLite database from {dataset_type} JSON files...")
    
    if dataset_type == "sample":
        reviews_file = "Amazon_Fashion_sample.json"
        meta_file = "meta_Amazon_Fashion_sample.json"
    else:
        reviews_file = "Amazon_Fashion.json"
        meta_file = "meta_Amazon_Fashion.json"
        
    if not os.path.exists(reviews_file) or not os.path.exists(meta_file):
        raise FileNotFoundError(f"Missing source JSON files: {reviews_file} or {meta_file}")
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            user_id TEXT,
            parent_asin TEXT,
            rating REAL,
            title TEXT,
            text TEXT,
            timestamp INTEGER
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS metadata (
            parent_asin TEXT PRIMARY KEY,
            title TEXT,
            store TEXT,
            price REAL,
            average_rating REAL,
            rating_number INTEGER,
            image_url TEXT,
            features TEXT
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_reviews_asin ON reviews(parent_asin)")
    conn.commit()
    
    # Insert metadata
    print(f"Reading metadata from {meta_file}...")
    with open(meta_file, 'r', encoding='utf-8') as f:
        metadata = json.load(f)
    
    print("Inserting metadata records...")
    meta_records = []
    for item in metadata:
        parent_asin = item.get("parent_asin")
        if not parent_asin:
            continue
            
        title = item.get("title", "Unknown Product")
        store = item.get("store", "Unknown Brand")
        price = item.get("price")
        if price is not None:
            try:
                price = float(price)
            except:
                price = None
        avg_rating = item.get("average_rating")
        rating_num = item.get("rating_number")
        
        # Get first image URL
        images = item.get("images", [])
        image_url = None
        if images and isinstance(images, list):
            image_url = images[0].get("large") or images[0].get("hi_res") or images[0].get("thumb")
            
        features = json.dumps(item.get("features", []))
        
        meta_records.append((parent_asin, title, store, price, avg_rating, rating_num, image_url, features))
        
    cursor.executemany("""
        INSERT OR REPLACE INTO metadata 
        (parent_asin, title, store, price, average_rating, rating_number, image_url, features)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, meta_records)
    conn.commit()
    print(f"Inserted {len(meta_records)} metadata records.")
    
    # Insert reviews
    print(f"Reading reviews from {reviews_file}...")
    with open(reviews_file, 'r', encoding='utf-8') as f:
        reviews = json.load(f)
        
    print("Inserting reviews records...")
    review_records = []
    for r in reviews:
        user_id = r.get("user_id")
        parent_asin = r.get("parent_asin")
        if not user_id or not parent_asin:
            continue
            
        rating = r.get("rating")
        title = r.get("title", "")
        text = r.get("text", "")
        timestamp = r.get("timestamp")
        
        review_records.append((user_id, parent_asin, rating, title, text, timestamp))
        
    cursor.executemany("""
        INSERT INTO reviews 
        (user_id, parent_asin, rating, title, text, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    """, review_records)
    conn.commit()
    print(f"Inserted {len(review_records)} review records.")
    
    conn.close()
    print("Database build complete.")

def load_recommender():
    global biases, reps, norm_reps, item_mapping, reverse_item_mapping, num_items
    
    print("Loading pre-trained representations and mappings...")
    if not os.path.exists(MAPPINGS_PATH):
        raise FileNotFoundError(f"Mappings file not found: {MAPPINGS_PATH}")
        
    with open(MAPPINGS_PATH, 'rb') as f:
        data = pickle.load(f)
        
    biases = data["biases"]
    reps = data["reps"]
    item_mapping = data["item_mapping"]
    reverse_item_mapping = data["reverse_item_mapping"]
    num_items = len(item_mapping)
    
    # Pre-compute normalized reps for cosine similarity
    norms = np.linalg.norm(reps, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    norm_reps = reps / norms
    
    print(f"Representations loaded successfully with {num_items} items.")
    
    # Check if database exists
    if not os.path.exists(DB_PATH):
        print("Warning: fashion_recommender.db not found!")
    else:
        print("SQLite database found.")

# Initialize recommender on startup
try:
    load_recommender()
except Exception as e:
    print(f"Error loading recommender system: {e}")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def call_llm_for_explanation(cand_title, cand_store, cand_features, h_title, h_store, h_features, strategy_desc):
    gemini_key = os.environ.get("GEMINI_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")

    # Minimum character length to accept an LLM response as valid.
    # Responses shorter than this are considered truncated / incomplete.
    MIN_RESPONSE_LEN = 80

    def get_feature_info(features):
        colors = [f for f in features if any(c in f.lower() for c in ["blue", "black", "white", "red", "green", "pink", "grey", "beige", "purple", "yellow", "orange", "brown", "dark", "light"])]
        styles = [f for f in features if f not in colors and f not in ["Ladieswear", "Menswear", "Baby/Children", "Sport", "Divided"]]
        return colors, styles

    cand_colors, cand_styles = get_feature_info(cand_features)
    h_colors, h_styles = get_feature_info(h_features)

    cand_color = cand_colors[0] if cand_colors else "chưa xác định"
    cand_style = cand_styles[0] if cand_styles else "chưa xác định"
    h_color = h_colors[0] if h_colors else "chưa xác định"
    h_style = h_styles[0] if h_styles else "chưa xác định"

    prompt = (
        "Bạn là chuyên gia tư vấn thời trang AI (ReFashion AI). "
        "Hãy viết một lời giải thích ngắn gọn, tự nhiên và chuyên nghiệp bằng tiếng Việt "
        "giải thích lý do tại sao sản phẩm gợi ý lại phù hợp với người dùng:\n"
        f"- Sản phẩm gợi ý: \"{cand_title}\" (Danh mục: {cand_store}, Màu: {cand_color}, Kiểu: {cand_style})\n"
        f"- Sản phẩm người dùng đã chọn: \"{h_title}\" (Danh mục: {h_store}, Màu: {h_color}, Kiểu: {h_style})\n"
        f"- Lý do AI gợi ý: {strategy_desc}\n\n"
        "Yêu cầu: Viết đúng 2 câu hoàn chỉnh, thân thiện như Stylist, "
        "có gợi ý phối đồ cụ thể. Không dùng thuật ngữ kỹ thuật."
    )

    import requests

    # ─── 1. Try Gemini REST API ───────────────────────────────────────────────
    if gemini_key:
        models_to_try = ["gemini-2.0-flash", "gemini-1.5-flash"]
        for model_name in models_to_try:
            try:
                url = (
                    f"https://generativelanguage.googleapis.com/v1beta/models/"
                    f"{model_name}:generateContent?key={gemini_key}"
                )
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "maxOutputTokens": 350,   # raised from 200 → avoids truncation
                        "temperature": 0.7,
                        "stopSequences": []
                    }
                }
                response = requests.post(
                    url, json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=8
                )

                if response.status_code == 200:
                    res_json = response.json()
                    candidate = res_json.get("candidates", [{}])[0]

                    # Check finish reason — only accept "STOP" (complete response)
                    finish_reason = candidate.get("finishReason", "")
                    text = ""
                    try:
                        text = candidate["content"]["parts"][0]["text"].strip()
                    except (KeyError, IndexError):
                        text = ""

                    if finish_reason == "STOP" and len(text) >= MIN_RESPONSE_LEN:
                        print(f"[LLM] {model_name} OK ({len(text)} chars)")
                        return text
                    else:
                        print(f"[LLM] {model_name} rejected: finishReason={finish_reason}, len={len(text)} — trying next model")
                else:
                    print(f"[LLM] {model_name} HTTP {response.status_code} — trying next model")

            except Exception as e:
                print(f"[LLM] {model_name} error: {e} — trying next model")

    # ─── 2. Try OpenAI REST API ───────────────────────────────────────────────
    if openai_key:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            payload = {
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 350,
                "temperature": 0.7
            }
            response = requests.post(
                url, json=payload,
                headers={"Content-Type": "application/json", "Authorization": f"Bearer {openai_key}"},
                timeout=8
            )
            if response.status_code == 200:
                text = response.json()["choices"][0]["message"]["content"].strip()
                if len(text) >= MIN_RESPONSE_LEN:
                    print(f"[LLM] OpenAI OK ({len(text)} chars)")
                    return text
                print(f"[LLM] OpenAI response too short ({len(text)} chars), using fallback")
            else:
                print(f"[LLM] OpenAI HTTP {response.status_code}")
        except Exception as e:
            print(f"[LLM] OpenAI error: {e}")

    # ─── 3. All LLM calls failed → caller will use template fallback ──────────
    print("[LLM] All providers failed or returned bad response — using template fallback")
    return None


def get_recommendation_explanation(candidate_asin, history_items, used_history_asins=None, used_types=None):
    """
    Generates a highly detailed, feature-based XAI explanation combined with LLM creative synthesis.
    """
    if not history_items:
        return {
            "type": "general",
            "reason": "💡 Gợi ý hàng đầu theo phong cách cá nhân."
        }

    # Query candidate metadata (store and features)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT title, store, features FROM metadata WHERE parent_asin = ?", (candidate_asin,))
    cand_row = cursor.fetchone()
    conn.close()

    if not cand_row:
        return {
            "type": "general",
            "reason": "💡 Sản phẩm nổi bật có lượt đánh giá cao."
        }

    cand_title = cand_row[0]
    cand_store = cand_row[1]
    
    cand_features = []
    if cand_row[2]:
        try:
            cand_features = json.loads(cand_row[2])
        except:
            pass

    # Extract all history features
    history_features_counts = {}
    history_categories_counts = {}
    
    # We will also compute similarity with specific history items
    # Using global pre-calculated representations
    cand_idx = item_mapping.get(candidate_asin)
    cand_vector = reps[cand_idx] if cand_idx is not None else None
    
    # Parse features for history items
    parsed_history_items = []
    for hist in history_items:
        h_asin = hist["parent_asin"]
        h_title = hist["title"]
        h_store = hist["store"]
        
        h_features = []
        if hist.get("features"):
            if isinstance(hist["features"], str):
                try:
                    h_features = json.loads(hist["features"])
                except:
                    pass
            elif isinstance(hist["features"], list):
                h_features = hist["features"]
                
        # Count occurrences for general profile modeling
        if h_store:
            history_categories_counts[h_store] = history_categories_counts.get(h_store, 0) + 1
        for f in h_features:
            history_features_counts[f] = history_features_counts.get(f, 0) + 1
            
        # Latent similarity
        sim = 0.0
        if cand_vector is not None:
            hist_idx = item_mapping.get(h_asin)
            if hist_idx is not None:
                hist_vector = reps[hist_idx]
                sim = float(np.dot(cand_vector, hist_vector) / (np.linalg.norm(cand_vector) * np.linalg.norm(hist_vector) or 1.0))
                
        parsed_history_items.append({
            "parent_asin": h_asin,
            "title": h_title,
            "store": h_store,
            "features": h_features,
            "sim": sim
        })

    # Sort parsed_history_items by similarity descending
    parsed_history_items.sort(key=lambda x: x["sim"], reverse=True)

    # Find the best history item to match with, preferring one that has NOT been used yet
    best_item = None
    if parsed_history_items:
        for item in parsed_history_items:
            if item["parent_asin"] not in used_history_asins:
                best_item = item
                break
        if not best_item:
            best_item = parsed_history_items[0]

    # Friendly translations mapping inside the function
    def get_friendly_feature_name(feature):
        translations = {
            "Garment Upper body": "kiểu dáng áo thiết kế",
            "Garment Lower body": "kiểu quần thời trang",
            "Knitwear": "chất dệt kim len ấm áp",
            "Jersey Basic": "chất thun trơn năng động",
            "Jersey Fancy": "chất thun kiểu cách điệu",
            "Outdoor": "phong cách mặc ngoài trời",
            "Accessories": "phụ kiện thời trang",
            "Shoes": "phong cách giày dép",
            "Bags": "dáng túi/balo tiện dụng",
            "Swimwear": "đồ bơi thời trang",
            "Ladieswear": "thời trang nữ",
            "Menswear": "thời trang nam",
            "Baby/Children": "thời trang trẻ em",
            "Sport": "phong cách thể thao năng động",
            "Divided": "phong cách trẻ trung phóng khoáng",
            "Light Grey": "màu xám nhạt thanh lịch",
            "Dark Blue": "màu xanh navy nam tính",
            "Black": "màu đen tối giản",
            "White": "màu trắng tinh khôi",
            "Red": "màu đỏ cá tính nổi bật",
            "Green": "màu xanh lá tươi mát",
            "Pink": "màu hồng ngọt ngào",
            "Grey": "màu xám",
            "Beige": "màu be nhã nhặn",
            "Purple": "màu tím cá tính",
            "Yellow": "màu vàng nổi bật",
            "Orange": "màu cam năng động",
            "Brown": "màu nâu ấm áp",
            "Dark Purple": "màu tím đậm bí ẩn",
            "Light Blue": "màu xanh nhạt dịu mắt",
            "Dark Grey": "màu xám đậm mạnh mẽ",
        }
        if feature in translations:
            return translations[feature]
        feature_lower = feature.lower()
        color_map = {
            "black": "màu đen",
            "white": "màu trắng",
            "blue": "màu xanh dương",
            "red": "màu đỏ",
            "green": "màu xanh lá",
            "pink": "màu hồng",
            "grey": "màu xám",
            "gray": "màu xám",
            "beige": "màu be",
            "purple": "màu tím",
            "yellow": "màu vàng",
            "orange": "màu cam",
            "brown": "màu nâu",
        }
        for eng, vie in color_map.items():
            if eng in feature_lower:
                if "light" in feature_lower:
                    return f"tông màu {vie} sáng nhẹ nhàng"
                elif "dark" in feature_lower:
                    return f"tông màu {vie} đậm mạnh mẽ"
                return f"tông màu {vie}"
        return feature.lower()

    def get_friendly_store_name(store):
        store_map = {
            "Áo Khoác": "chiếc áo khoác",
            "Áo Thun": "chiếc áo thun",
            "Quần": "chiếc quần",
            "Giày": "đôi giày",
            "Balo & Túi": "chiếc túi/balo",
        }
        return store_map.get(store, "sản phẩm thời trang")

    def get_feature_info(features):
        colors = [f for f in features if any(c in f.lower() for c in ["blue", "black", "white", "red", "green", "pink", "grey", "beige", "purple", "yellow", "orange", "brown", "dark", "light"])]
        styles = [f for f in features if f not in colors and f not in ["Ladieswear", "Menswear", "Baby/Children", "Sport", "Divided"]]
        return colors, styles

    # Try LLM integration or fall back to detailed hybrid template
    if best_item:
        h_asin = best_item["parent_asin"]
        h_title = best_item["title"]
        h_store = best_item["store"]
        best_sim = best_item["sim"]
        
        shared_features = [f for f in cand_features if f in best_item["features"]]
        cand_colors, cand_styles = get_feature_info(cand_features)
        shared_colors, shared_styles = get_feature_info(shared_features)
        
        # Strategy A: Color Matching
        if shared_colors and "color_match" not in used_types:
            friendly_color = get_friendly_feature_name(shared_colors[0])
            friendly_h_store = get_friendly_store_name(h_store)
            strategy_desc = f"Sản phẩm phối màu cực tốt ({friendly_color}) cùng {friendly_h_store}"
            
            # Call LLM
            llm_reason = call_llm_for_explanation(cand_title, cand_store, cand_features, h_title, h_store, best_item["features"], strategy_desc)
            if not llm_reason:
                llm_reason = f"💡 Gợi ý phối màu từ AI: Sản phẩm sở hữu {friendly_color} tạo sự đồng điệu tuyệt vời cùng {friendly_h_store} ({h_title}) mà bạn đã chọn. Sự kết hợp này mang lại sự cân bằng sắc thái đầy ấn tượng, giúp bộ trang phục trở nên thanh lịch và có chiều sâu. Bạn có thể phối thêm một chiếc túi hoặc kính mát để hoàn thiện set đồ."
                
            return {
                "type": "color_match",
                "reason": llm_reason,
                "matched_asin": h_asin
            }
            
        # Strategy B: Style/Material Alignment
        if shared_styles and "style_match" not in used_types:
            friendly_style = get_friendly_feature_name(shared_styles[0])
            friendly_h_store = get_friendly_store_name(h_store)
            strategy_desc = f"Chất liệu & kiểu dáng tương đồng ({friendly_style}) cùng {friendly_h_store}"
            
            # Call LLM
            llm_reason = call_llm_for_explanation(cand_title, cand_store, cand_features, h_title, h_store, best_item["features"], strategy_desc)
            if not llm_reason:
                llm_reason = f"💡 Đồng điệu phong cách: Thiết kế mang {friendly_style} vô cùng ăn ý với {friendly_h_store} ({h_title}) bạn đã chọn. Sự đồng nhất về chất liệu và phom dáng thiết kế giúp bạn tự tin thể hiện phong cách cá nhân năng động và lịch lãm. Hãy thử kết hợp cùng một đôi giày sneakers để tạo nên diện mạo hoàn hảo."
                
            return {
                "type": "style_match",
                "reason": llm_reason,
                "matched_asin": h_asin
            }

        # Strategy C: Category Complement
        if cand_store != h_store and "complementary" not in used_types:
            friendly_cand_store = get_friendly_store_name(cand_store)
            friendly_h_store = get_friendly_store_name(h_store)
            strategy_desc = f"Mix & Match bổ trợ chéo danh mục ({friendly_cand_store} và {friendly_h_store})"
            
            # Call LLM
            llm_reason = call_llm_for_explanation(cand_title, cand_store, cand_features, h_title, h_store, best_item["features"], strategy_desc)
            if not llm_reason:
                llm_reason = f"💡 Mix & Match lý tưởng: AI đề xuất phối {friendly_cand_store} này để tạo nên set đồ hoàn hảo cùng {friendly_h_store} ({h_title}) bạn đã chọn. Sự tương phản đầy nghệ thuật giữa hai sản phẩm giúp bộ trang phục năng động và thời thượng hơn. Bạn có thể mặc đi làm, đi chơi hoặc dạo phố đều rất phù hợp."
                
            return {
                "type": "complementary",
                "reason": llm_reason,
                "matched_asin": h_asin
            }

        # Strategy D: High Design Similarity
        if "design_similarity" not in used_types:
            sim_percent = int(round(best_sim * 100))
            friendly_h_store = get_friendly_store_name(h_store)
            strategy_desc = f"Độ tương đồng phom dáng đạt {sim_percent}% với {friendly_h_store}"
            
            # Call LLM
            llm_reason = call_llm_for_explanation(cand_title, cand_store, cand_features, h_title, h_store, best_item["features"], strategy_desc)
            if not llm_reason:
                llm_reason = f"💡 Kiểu dáng tương đồng: Thiết kế phom dáng đạt {sim_percent}% nét tương hợp với {friendly_h_store} ({h_title}) bạn đã chọn. Từ các chi tiết đường may đến cấu trúc cổ áo/ống quần đều thể hiện sự ăn ý tuyệt đối. Đây sẽ là sự bổ sung tuyệt vời vào tủ đồ thời trang của bạn."
                
            return {
                "type": "design_similarity",
                "reason": llm_reason,
                "matched_asin": h_asin
            }

    # Strategy E: Popular feature match (Profile overlap)
    popular_matches = []
    for f in cand_features:
        count = history_features_counts.get(f, 0)
        if count >= 2 or (len(history_items) > 0 and count / len(history_items) >= 0.3):
            popular_matches.append(f)
            
    if popular_matches and "profile_overlap" not in used_types:
        friendly_match = get_friendly_feature_name(popular_matches[0])
        return {
            "type": "profile_overlap",
            "reason": f"💡 Đúng gu của bạn: Thiết kế sở hữu {friendly_match} bạn thường quan tâm gần đây. AI nhận thấy bạn yêu thích các sản phẩm có xu hướng phóng khoáng, thoải mái nhưng vẫn lịch lãm. Sản phẩm này hứa hẹn sẽ mang đến cảm giác quen thuộc và tôn dáng tuyệt đối khi mặc.",
            "matched_asin": None
        }

    # Strategy F: Category Preference
    if cand_store and cand_store in history_categories_counts and "category_preference" not in used_types:
        cat_ratio = history_categories_counts[cand_store] / len(history_items)
        if cat_ratio >= 0.25:
            percent = int(round(cat_ratio * 100))
            return {
                "type": "category_preference",
                "reason": f"💡 Nhóm đồ ưu tiên: Dòng sản phẩm này chiếm {percent}% trong tổng số các lượt chọn gần đây của bạn. Điều này thể hiện nhu cầu lớn của bạn đối với dòng sản phẩm {cand_store}. Sản phẩm mới này được cập nhật phom dáng hiện đại nhất để đáp ứng trọn vẹn sở thích của bạn.",
                "matched_asin": None
            }

    # Fallback to general but detailed messages based on candidate store
    store_fallbacks = {
        "Áo Khoác": "💡 Gợi ý áo khoác thiết kế thời thượng: Mẫu áo khoác có chất liệu cao cấp, phom dáng tôn lên nét lịch thiệp, dễ dàng kết hợp với các trang phục trơn basic hàng ngày để giữ ấm và tăng tính thời trang.",
        "Giày": "💡 Gợi ý giày năng động: Thiết kế giày tối giản với đế cao su êm ái, nâng đỡ bàn chân hoàn hảo. Mẫu giày cực kỳ thích hợp để đi học, đi làm hay dạo phố dài ngày mà không gây mỏi mệt.",
        "Áo Thun": "💡 Gợi ý áo thun basic: Mẫu áo thun có chất liệu cotton mát mịn, co giãn và thấm hút tốt. Sản phẩm là món đồ cơ bản lý tưởng để phối kèm áo khoác ngoài hoặc mặc trơn đơn giản.",
        "Quần": "💡 Gợi ý phom quần chuẩn dáng: Thiết kế quần mang tính ứng dụng cao, đường may tỉ mỉ tạo phom đứng dáng thanh lịch. Phù hợp diện cùng áo sơ mi hoặc áo thun trong nhiều sự kiện.",
        "Balo & Túi": "💡 Phụ kiện cá tính: Chiếc balo/túi xách với nhiều ngăn chứa tiện dụng và quai đeo êm ái. Sản phẩm hoàn thiện điểm nhấn thời thượng và giúp bạn mang theo các vật dụng thiết yếu một cách ngăn nắp."
    }
    
    fallback_reason = store_fallbacks.get(cand_store, "💡 Gợi ý cá nhân hóa: Sản phẩm có chất lượng gia công cao, thiết kế dễ phối đồ. Dựa trên phân tích xu hướng mua sắm của nhóm khách hàng tương đồng, đây là món đồ tuyệt vời để làm phong phú phong cách cá nhân của bạn.")
    return {
        "type": f"fallback_{cand_store}",
        "reason": fallback_reason,
        "matched_asin": None
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/users')
def get_users():
    """Returns top active users in the database for UI selector."""
    conn = get_db()
    cursor = conn.cursor()
    # Find active users with reviews count
    cursor.execute("""
        SELECT user_id, COUNT(*) as review_count 
        FROM reviews 
        GROUP BY user_id 
        ORDER BY review_count DESC 
        LIMIT 10
    """)
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    # Check if loaded model contains these users
    for user in users:
        user['in_model'] = user['user_id'] in user_mapping
        
    return jsonify(users)

@app.route('/api/user/<user_id>')
def get_user_profile(user_id):
    """Retrieves user profile (past purchases, ratings, and comments)."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get user reviews joined with product metadata
    cursor.execute("""
        SELECT r.parent_asin, r.rating, r.title as review_title, r.text as review_text, r.timestamp,
               m.title as product_title, m.image_url, m.store, m.price, m.average_rating
        FROM reviews r
        LEFT JOIN metadata m ON r.parent_asin = m.parent_asin
        WHERE r.user_id = ?
        ORDER BY r.timestamp DESC
    """, (user_id,))
    
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return jsonify({"error": f"User ID '{user_id}' not found in database."}), 404
        
    reviews = []
    for row in rows:
        reviews.append({
            "parent_asin": row["parent_asin"],
            "rating": row["rating"],
            "review_title": row["review_title"],
            "review_text": row["review_text"],
            "timestamp": row["timestamp"],
            "product_title": row["product_title"] or "Unknown Product",
            "image_url": row["image_url"],
            "store": row["store"] or "Unknown Store",
            "price": row["price"],
            "average_rating": row["average_rating"]
        })
        
    return jsonify({
        "user_id": user_id,
        "review_count": len(reviews),
        "in_model": user_id in user_mapping,
        "history": reviews
    })

@app.route('/api/survey/items', methods=['GET'])
def get_survey_items():
    """Returns a diverse set of items grouped by their category (store) for onboarding style picker."""
    global survey_shown_asins
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT parent_asin, title, store, price, image_url, average_rating, rating_number, features FROM metadata WHERE image_url IS NOT NULL AND image_url != ''")
    rows = cursor.fetchall()
    conn.close()
    
    valid_items = [dict(r) for r in rows if r['parent_asin'] in item_mapping]
    
    # Group items by category (store)
    categories = ["Áo Khoác", "Balo & Túi", "Áo Thun", "Quần", "Giày"]
    grouped_items = {cat: [] for cat in categories}
    
    for item in valid_items:
        cat = item.get('store')
        if cat in grouped_items:
            grouped_items[cat].append(item)
            
    # For each category, select 15 items ensuring style and color diversity
    final_items = []
    for cat in categories:
        cat_items = grouped_items[cat]
        cat_items.sort(key=lambda x: x.get('rating_number', 0) or 0, reverse=True)
        
        selected = []
        seen_colors = set()
        seen_styles = set()
        
        # Pass 1: Try to pick items that have BOTH a new color and a new style
        for item in cat_items:
            features = []
            if item.get('features'):
                try:
                    features = json.loads(item['features'])
                except:
                    pass
            
            style = features[1] if len(features) > 1 else (features[0] if features else None)
            color = features[2] if len(features) > 2 else (features[0] if features else None)
            
            if style and color and (style not in seen_styles) and (color not in seen_colors):
                seen_styles.add(style)
                seen_colors.add(color)
                selected.append(item)
                if len(selected) >= 15:
                    break
                    
        # Pass 2: If we need more, try to pick items with either a new color OR a new style
        if len(selected) < 15:
            for item in cat_items:
                if item in selected:
                    continue
                features = []
                if item.get('features'):
                    try:
                        features = json.loads(item['features'])
                    except:
                        pass
                style = features[1] if len(features) > 1 else (features[0] if features else None)
                color = features[2] if len(features) > 2 else (features[0] if features else None)
                
                if (style and style not in seen_styles) or (color and color not in seen_colors):
                    if style: seen_styles.add(style)
                    if color: seen_colors.add(color)
                    selected.append(item)
                    if len(selected) >= 15:
                        break
                        
        # Pass 3: Fill the rest with the most popular items remaining
        if len(selected) < 15:
            for item in cat_items:
                if item not in selected:
                    selected.append(item)
                    if len(selected) >= 15:
                        break
                        
        final_items.extend(selected)
    
    # ─── Cache ALL surfaced ASINs so recommendations can exclude them ───
    survey_shown_asins = {item['parent_asin'] for item in final_items}
    print(f"[Survey] Cached {len(survey_shown_asins)} picker ASINs – these will be excluded from recommendations.")
        
    return jsonify(final_items)

@app.route('/api/recommend/survey', methods=['POST'])
def recommend_by_survey():
    """
    Generates 1 recommendation per fashion category based on survey selections.
    Uses a per-category centroid vector so results are always diverse and non-repeating.
    """
    data = request.json or {}
    selected_asins = data.get('selected_asins', [])

    # ── Fallback: old question-based scoring if no ASINs provided ─────────────
    if not selected_asins:
        pref_price = data.get('price')
        pref_category = data.get('category')
        pref_brand_style = data.get('brand_style')
        pref_psychology = data.get('psychology')

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT parent_asin, title, store, price, average_rating FROM metadata")
        rows = cursor.fetchall()
        conn.close()

        scored_items = []
        for row in rows:
            asin = row['parent_asin']
            title_lower = (row['title'] or "").lower()
            brand_lower = (row['store'] or "").lower()
            item_price = row['price']
            rating_val = row['average_rating'] or 0.0

            price_score = 0
            if pref_price:
                if pref_price == "budget" and item_price is not None and item_price < 10:
                    price_score = 3
                elif pref_price == "affordable" and item_price is not None and 10 <= item_price < 30:
                    price_score = 3
                elif pref_price == "mid_range" and item_price is not None and 30 <= item_price < 75:
                    price_score = 3
                elif pref_price == "premium" and item_price is not None and item_price >= 75:
                    price_score = 3
                elif item_price is None:
                    price_score = 1

            cat_score = 0
            if pref_category == "athletic":
                if any(kw in title_lower for kw in ["workout", "gym", "sport", "jersey", "leggings", "tee", "active", "run"]):
                    cat_score = 3
            elif pref_category == "accessories":
                if any(kw in title_lower for kw in ["sunglasses", "scarf", "pendant", "earmuff", "cap", "hat", "crystal", "jewelry"]):
                    cat_score = 3
            elif pref_category == "footwear":
                if any(kw in title_lower for kw in ["slippers", "shoes", "socks", "orthopedic", "slip-on", "feet"]):
                    cat_score = 3
            elif pref_category == "apparel":
                if any(kw in title_lower for kw in ["cardigan", "cape", "dress", "vest", "kimono", "ruana", "shawl", "sleeve"]):
                    cat_score = 3

            brand_score = 0
            if pref_brand_style == "sporty_brands":
                if any(b in brand_lower for b in ["jeep", "sport tek", "sport-tek", "aoxjox", "posicharge"]):
                    brand_score = 2
            elif pref_brand_style == "elegant_brands":
                if any(b in brand_lower for b in ["orchid row", "pendantscarf", "moyabo"]):
                    brand_score = 2
            elif pref_brand_style == "premium_brands":
                if any(b in brand_lower for b in ["michael kors", "orthofeet", "michael michael kors"]):
                    brand_score = 2
            elif pref_brand_style == "casual_brands":
                if any(b in brand_lower for b in ["polo", "owl", "faroot"]):
                    brand_score = 2

            psych_score = 0
            if pref_psychology == "health" and "orthofeet" in brand_lower:
                psych_score = 2
            elif pref_psychology == "utility" and rating_val >= 4.5:
                psych_score = 1.5
            elif pref_psychology == "bargain" and item_price is not None and item_price < 15:
                psych_score = 1.5

            total_score = price_score + cat_score + brand_score + psych_score + (rating_val * 0.1)
            scored_items.append((asin, total_score))

        scored_items.sort(key=lambda x: x[1], reverse=True)
        seed_asin = next((a for a, _ in scored_items if a in item_mapping), None)
        if not seed_asin:
            seed_asin = list(item_mapping.keys())[0]
        selected_asins = [seed_asin]

    # ── Compute item embeddings once ──────────────────────────────────────────
    # Using global pre-calculated representations

    # ── Build per-category seed vectors from selected ASINs ───────────────────
    CATEGORIES = ["Áo Khoác", "Balo & Túi", "Áo Thun", "Quần", "Giày"]
    excluded_asins = set(selected_asins) | survey_shown_asins
    excluded_indices = {item_mapping[a] for a in excluded_asins if a in item_mapping}

    # Using global pre-computed norm_reps

    conn = get_db()
    cursor = conn.cursor()

    # ── Get seeds metadata (for XAI) ─────────────────────────────────────────
    seeds_metadata = []
    seeds_by_category = {cat: [] for cat in CATEGORIES}

    for asin in selected_asins:
        cursor.execute(
            "SELECT parent_asin, title, store, price, features FROM metadata WHERE parent_asin = ?",
            (asin,)
        )
        seed_row = cursor.fetchone()
        if not seed_row:
            continue
        seed_dict = dict(seed_row)
        seed_dict["parent_asin"] = asin
        raw_feats = seed_dict.get("features")
        if isinstance(raw_feats, str):
            try:
                seed_dict["features"] = json.loads(raw_feats)
            except Exception:
                seed_dict["features"] = []
        elif not isinstance(raw_feats, list):
            seed_dict["features"] = []
        seeds_metadata.append(seed_dict)

        cat = seed_dict.get("store")
        if cat in seeds_by_category:
            seeds_by_category[cat].append(asin)

    # Build a global centroid as ultimate fallback
    global_seed_vecs = [reps[item_mapping[a]] for a in selected_asins if a in item_mapping]
    if not global_seed_vecs:
        global_seed_vecs = [reps[0]]
    global_centroid = np.mean(global_seed_vecs, axis=0)
    global_centroid_norm = global_centroid / (np.linalg.norm(global_centroid) or 1.0)

    # ── Load all candidates not in excluded set ───────────────────────────────
    cursor.execute(
        "SELECT parent_asin, title, store, price, average_rating, rating_number, image_url, features "
        "FROM metadata WHERE store IN ('Áo Khoác','Balo & Túi','Áo Thun','Quần','Giày') "
        "AND image_url IS NOT NULL AND image_url != ''"
    )
    all_candidates = {}  # store → list of prod dicts
    for row in cursor.fetchall():
        asin = row["parent_asin"]
        if asin in excluded_asins or asin not in item_mapping:
            continue
        cat = row["store"]
        if cat not in all_candidates:
            all_candidates[cat] = []
        all_candidates[cat].append(dict(row))

    # ── Generate 1 best recommendation per category ───────────────────────────
    recommendations = []
    used_history_asins = set()
    used_types = set()

    for cat in CATEGORIES:
        cat_candidates = all_candidates.get(cat, [])
        if not cat_candidates:
            print(f"[Rec] No candidates for category '{cat}', skipping.")
            continue

        # Build the query vector for this category:
        # Use seeds FROM this category if available, otherwise fall back to global centroid
        cat_seed_asins = seeds_by_category.get(cat, [])
        if cat_seed_asins:
            cat_vecs = [reps[item_mapping[a]] for a in cat_seed_asins if a in item_mapping]
            query_vec = np.mean(cat_vecs, axis=0)
        else:
            query_vec = global_centroid.copy()
        query_norm = query_vec / (np.linalg.norm(query_vec) or 1.0)

        # Score all candidates in this category
        best_asin = None
        best_score = -9999
        for prod in cat_candidates:
            asin = prod["parent_asin"]
            idx = item_mapping[asin]
            score = float(np.dot(norm_reps[idx], query_norm))
            if score > best_score:
                best_score = score
                best_asin = asin
                best_prod = prod

        if not best_asin:
            continue

        features = []
        raw_feats = best_prod.get("features")
        if raw_feats:
            try:
                features = json.loads(raw_feats)
            except Exception:
                pass

        match_percentage = int(min(max((best_score + 1) * 50, 0), 100))

        xai_explanation = get_recommendation_explanation(
            best_asin, seeds_metadata, used_history_asins, set(used_types)
        )
        if xai_explanation.get("matched_asin"):
            used_history_asins.add(xai_explanation["matched_asin"])
        used_types.add(xai_explanation["type"])

        recommendations.append({
            "parent_asin": best_asin,
            "score": best_score,
            "match_percentage": match_percentage,
            "title": best_prod.get("title", "Unknown Product"),
            "store": best_prod.get("store", cat),
            "category": cat,
            "price": best_prod.get("price"),
            "average_rating": best_prod.get("average_rating") or 0,
            "rating_number": best_prod.get("rating_number") or 0,
            "image_url": best_prod.get("image_url"),
            "features": features[:3],
            "explanation": xai_explanation["reason"]
        })
        print(f"[Rec] {cat.encode('ascii', 'ignore').decode()}: {best_asin} score={best_score:.3f}")

    conn.close()

    return jsonify({
        "seed_products": seeds_metadata,
        "recommendations": recommendations
    })

@app.route('/api/recommend/<user_id>')
def recommend(user_id):
    """Predicts recommendations using the pre-trained LightFM model."""
    if user_id not in user_mapping:
        return jsonify({"error": f"User ID '{user_id}' is not in the model training set."}), 404
        
    # Get internal user index
    internal_user_id = user_mapping[user_id]
    internal_item_ids = np.arange(num_items)
    
    # Predict scores
    scores = model.predict(
        internal_user_id,
        internal_item_ids,
        item_features=item_features_matrix
    )
    
    # Get top 5 recommendation indices
    top_indices = np.argsort(-scores)[:5]
    top_asins = [reverse_item_mapping[idx] for idx in top_indices]
    top_scores = [float(scores[idx]) for idx in top_indices]
    
    # Query database for product metadata and user history
    conn = get_db()
    cursor = conn.cursor()
    
    # Fetch positive user history for XAI explanation
    # Pre-parse features to list for consistent handling
    cursor.execute("""
        SELECT r.parent_asin, m.title, m.store, m.features
        FROM reviews r
        LEFT JOIN metadata m ON r.parent_asin = m.parent_asin
        WHERE r.user_id = ? AND r.rating >= 4.0
    """, (user_id,))
    raw_history = cursor.fetchall()
    history_items = []
    for row in raw_history:
        item = dict(row)
        raw_feats = item.get("features")
        if isinstance(raw_feats, str):
            try:
                item["features"] = json.loads(raw_feats)
            except Exception:
                item["features"] = []
        elif not isinstance(raw_feats, list):
            item["features"] = []
        history_items.append(item)
    
    placeholders = ",".join("?" for _ in top_asins)
    cursor.execute(f"""
        SELECT parent_asin, title, store, price, average_rating, rating_number, image_url, features
        FROM metadata
        WHERE parent_asin IN ({placeholders})
    """, top_asins)
    
    product_rows = {row["parent_asin"]: dict(row) for row in cursor.fetchall()}
    conn.close()
    
    # Merge prediction score with database metadata
    recommendations = []
    used_history_asins = set()
    used_types = set()
    for asin, score in zip(top_asins, top_scores):
        prod = product_rows.get(asin, {})
        
        # Parse features JSON
        features = []
        if prod.get("features"):
            try:
                features = json.loads(prod["features"])
            except:
                pass
                
        match_percentage = int(min(max((score + 1) * 50, 0), 100))
        
        # Pass a copy of used_types so each item gets a fresh strategy
        # evaluation while still avoiding repeated seed citations
        xai_explanation = get_recommendation_explanation(
            asin, history_items, used_history_asins, set(used_types)
        )
        if xai_explanation.get("matched_asin"):
            used_history_asins.add(xai_explanation["matched_asin"])
        used_types.add(xai_explanation["type"])
        
        recommendations.append({
            "parent_asin": asin,
            "score": score,
            "match_percentage": match_percentage,
            "title": prod.get("title", "Unknown Product"),
            "store": prod.get("store", "Unknown Store"),
            "price": prod.get("price"),
            "average_rating": prod.get("average_rating") or 0,
            "rating_number": prod.get("rating_number") or 0,
            "image_url": prod.get("image_url"),
            "features": features[:3],
            "explanation": xai_explanation["reason"]
        })
        
    return jsonify({
        "user_id": user_id,
        "recommendations": recommendations
    })

if __name__ == "__main__":
    # Start the Flask development server on port 5000
    app.run(host="0.0.0.0", port=5000, debug=True)
