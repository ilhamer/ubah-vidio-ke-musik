import os
from flask import Flask, render_template, request, send_file, jsonify
from moviepy.editor import VideoFileClip
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB limit
app.config['ALLOWED_EXTENSIONS'] = {'mp4', 'avi', 'mov', 'mkv'}

# Buat folder uploads jika belum ada
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # Cek jika file ada
        if 'file' not in request.files:
            return jsonify({'error': 'Tidak ada file yang dipilih'}), 400
        
        file = request.files['file']
        output_format = request.form.get('format', 'mp3')
        
        if file.filename == '':
            return jsonify({'error': 'Nama file kosong'}), 400
        
        if not (file and allowed_file(file.filename)):
            return jsonify({'error': 'Format file tidak didukung'}), 400
        
        try:
            filename = secure_filename(file.filename)
            input_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(input_path)
            
            # Proses konversi
            output_filename = f"{os.path.splitext(filename)[0]}.{output_format}"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            
            if output_format == 'mp3':
                video = VideoFileClip(input_path)
                video.audio.write_audiofile(output_path)
                video.close()
            else:
                return jsonify({'error': 'Format output tidak didukung'}), 400
            
            # Kirim file hasil konversi
            return send_file(
                output_path,
                as_attachment=True,
                download_name=output_filename
            )
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
            
        finally:
            # Bersihkan file temporary
            for file_path in [input_path, output_path]:
                if file_path and os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                    except:
                        pass
    
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)