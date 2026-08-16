import os
import sys
import tempfile
import urllib.parse
import uuid
import re
from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import yt_dlp

app = Flask(__name__)
CORS(app)

PORT = 5000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_DOWNLOADS_DIR = os.path.join(BASE_DIR, 'temp_downloads')
os.makedirs(TEMP_DOWNLOADS_DIR, exist_ok=True)

# Locate and configure bundled ffmpeg binary directory
FFMPEG_DIR = os.path.join(BASE_DIR, 'node_modules', 'ffmpeg-static')
FFMPEG_EXE = os.path.join(FFMPEG_DIR, 'ffmpeg.exe')

if os.path.exists(FFMPEG_DIR):
    os.environ["PATH"] = FFMPEG_DIR + os.pathsep + os.environ.get("PATH", "")
    print(f"[*] Added FFmpeg to PATH: {FFMPEG_DIR}")
else:
    FFMPEG_DIR = None
    print("[*] Using system FFmpeg from PATH")

def sanitize_filename(name):
    """Sanitizes filename for clean safe downloading across all OS"""
    clean = re.sub(r'[^\w\s\-\.]', '', name)
    clean = re.sub(r'\s+', '_', clean).strip()
    return clean[:80] or "Amyth_Video"

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "engine": "Amyth Python yt-dlp + 4K HD Engine",
        "ffmpeg": os.path.exists(FFMPEG_EXE) if FFMPEG_EXE else True
    })

@app.route('/api/info', methods=['GET'])
def video_info():
    url = request.args.get('url')
    video_id = request.args.get('videoId')
    
    if not url and video_id:
        url = f"https://www.youtube.com/watch?v={video_id}"
        
    if not url:
        return jsonify({"error": "url or videoId is required"}), 400

    try:
        ydl_opts = {
            'skip_download': True,
            'quiet': True,
            'no_warnings': True,
            'ffmpeg_location': FFMPEG_DIR,
            'js_runtimes': {'node': {'path': 'node'}},
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            view_count = info.get('view_count', 0)
            duration = info.get('duration', 180)
            
            return jsonify({
                "videoId": info.get('id', video_id),
                "title": info.get('title', 'YouTube Video'),
                "author": info.get('uploader') or info.get('channel', 'YouTube Creator'),
                "durationSeconds": duration,
                "viewCount": f"{view_count:,}",
                "rawViewCount": view_count,
                "thumbnail": info.get('thumbnail') or f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg",
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/download', methods=['GET'])
def download_video():
    url = request.args.get('url')
    video_id = request.args.get('videoId')
    format_type = request.args.get('format', 'mp4').lower()
    quality = request.args.get('quality', '1080p')
    trim = request.args.get('trim', '0')
    start = request.args.get('start', '0')
    end = request.args.get('end', '0')

    if not url and video_id:
        url = f"https://www.youtube.com/watch?v={video_id}"

    if not url:
        return Response("URL or videoId is required", status=400)

    unique_id = str(uuid.uuid4())[:8]
    disk_filename_template = os.path.join(TEMP_DOWNLOADS_DIR, f"{unique_id}_media.%(ext)s")

    try:
        target_height = int(quality.replace('p', '')) if 'p' in quality else 1080
        is_trimmed = trim == '1' and float(end) > float(start)

        ydl_opts = {
            'outtmpl': disk_filename_template,
            'ffmpeg_location': FFMPEG_DIR,
            'js_runtimes': {'node': {'path': 'node'}},
            'quiet': True,
            'no_warnings': True,
            'overwrites': True,
        }

        if format_type == 'mp3':
            audio_bitrate = quality.replace('kbps', '') if 'kbps' in quality else '320'
            ydl_opts.update({
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': audio_bitrate,
                }],
            })
        else:
            # If highest or max requested, download absolute maximum allowed resolution
            if quality in ('highest', 'max', '2160p', '4k'):
                format_str = "bestvideo+bestaudio/best"
            else:
                target_height = int(quality.replace('p', '')) if 'p' in quality else 1080
                format_str = f"bestvideo[height<={target_height}]+bestaudio/best[height<={target_height}]/best"
            
            ydl_opts.update({
                'format': format_str,
                'merge_output_format': 'mp4',
            })

        if is_trimmed:
            ydl_opts['download_ranges'] = yt_dlp.utils.download_range_func(None, [(float(start), float(end))])
            ydl_opts['force_keyframes_at_cuts'] = True

        # Perform the download & FFmpeg audio+video merge
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            raw_title = info.get('title', 'Amyth_Video')
            clean_title = sanitize_filename(raw_title)

        # Locate the created merged file in temp directory
        downloaded_file = None
        for file in os.listdir(TEMP_DOWNLOADS_DIR):
            if file.startswith(f"{unique_id}_media"):
                downloaded_file = os.path.join(TEMP_DOWNLOADS_DIR, file)
                break

        if not downloaded_file or not os.path.exists(downloaded_file):
            return Response("Failed to generate high resolution video file", status=500)

        file_ext = 'mp3' if format_type == 'mp3' else 'mp4'
        final_filename = f"{clean_title}_{quality}{'_trimmed' if is_trimmed else ''}.{file_ext}"

        mimetype = 'audio/mpeg' if format_type == 'mp3' else 'video/mp4'
        encoded_filename = urllib.parse.quote(final_filename)

        # Stream the file and safely delete AFTER the file stream is completely closed
        def generate_and_cleanup():
            try:
                with open(downloaded_file, 'rb') as f:
                    while True:
                        chunk = f.read(65536) # 64 KB chunks
                        if not chunk:
                            break
                        yield chunk
            finally:
                try:
                    if os.path.exists(downloaded_file):
                        os.remove(downloaded_file)
                except Exception:
                    pass

        response = Response(generate_and_cleanup(), mimetype=mimetype)
        response.headers['Content-Disposition'] = f'attachment; filename="{encoded_filename}"; filename*=UTF-8\'\'{encoded_filename}'
        response.headers['Content-Length'] = os.path.getsize(downloaded_file)
        response.headers['Cache-Control'] = 'no-cache'
        return response

    except Exception as e:
        return Response(f"Download error: {str(e)}", status=500)

# Serve built frontend in production
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    dist_dir = os.path.join(BASE_DIR, 'dist')
    if path != "" and os.path.exists(os.path.join(dist_dir, path)):
        from flask import send_from_directory
        return send_from_directory(dist_dir, path)
    elif os.path.exists(os.path.join(dist_dir, 'index.html')):
        from flask import send_from_directory
        return send_from_directory(dist_dir, 'index.html')
    else:
        return jsonify({"message": "Amyth Downloader API is active. Build frontend with 'npm run build'."})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[*] Amyth Downloader Python Engine running on port {port}")
    app.run(host='0.0.0.0', port=port, threaded=True, debug=False)
