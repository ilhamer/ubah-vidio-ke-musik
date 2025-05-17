document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi komponen Materialize
    M.AutoInit();
    
    // Elemen DOM
    const form = document.getElementById('converter-form');
    const fileInput = document.getElementById('file-input');
    const formatSelect = document.getElementById('format-select');
    const convertBtn = document.getElementById('convert-btn');
    const progressBar = document.getElementById('progress-bar');
    const statusMessage = document.getElementById('status-message');
    
    // Update nama file yang dipilih
    fileInput.addEventListener('change', function() {
        const fileName = this.files[0] ? this.files[0].name : 'Pilih file';
        document.querySelector('.file-path').value = fileName;
    });
    
    // Tangani form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validasi form
        if (!fileInput.files[0]) {
            showStatus('Silakan pilih file video!', 'error');
            return;
        }
        
        if (!formatSelect.value) {
            showStatus('Silakan pilih format output!', 'error');
            return;
        }
        
        // Tampilkan loading state
        showLoading(true);
        showStatus('Sedang memproses file...', 'info');
        
        try {
            const formData = new FormData(form);
            const response = await fetch('/', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                // Handle file download
                const blob = await response.blob();
                const filename = getDownloadFilename(fileInput.files[0].name, formatSelect.value);
                downloadFile(blob, filename);
                
                showStatus('Konversi berhasil! File sedang diunduh...', 'success');
                M.toast({html: 'Konversi berhasil!', classes: 'green'});
            } else {
                // Handle error response
                const errorData = await response.json();
                throw new Error(errorData.error || 'Gagal mengkonversi file');
            }
        } catch (error) {
            console.error('Error:', error);
            showStatus(`Error: ${error.message}`, 'error');
            M.toast({html: `Error: ${error.message}`, classes: 'red'});
        } finally {
            // Reset loading state
            showLoading(false);
        }
    });
    
    // Fungsi untuk menampilkan status
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.style.color = type === 'error' ? '#c62828' : 
                                   type === 'success' ? '#2e7d32' : '#1565c0';
    }
    
    // Fungsi untuk menampilkan/menyembunyikan loading state
    function showLoading(isLoading) {
        if (isLoading) {
            progressBar.style.display = 'block';
            convertBtn.disabled = true;
            convertBtn.innerHTML = 'Memproses... <i class="material-icons right">hourglass_top</i>';
        } else {
            progressBar.style.display = 'none';
            convertBtn.disabled = false;
            convertBtn.innerHTML = 'Konversi <i class="material-icons right">send</i>';
        }
    }
    
    // Fungsi untuk menentukan nama file download
    function getDownloadFilename(originalName, format) {
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
        return `${nameWithoutExt}.${format}`;
    }
    
    // Fungsi untuk memicu download file
    function downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }
});