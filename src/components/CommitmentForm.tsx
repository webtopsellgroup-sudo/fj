import React, { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Send, Download, AlertCircle, CheckCircle, FileText, Eye, Trash2 } from 'lucide-react';
import SignaturePad from './SignaturePad';
import { FormData } from '../types/FormData';
import { uploadToImgBB } from '../services/imageUpload';
import { sendToWebhook } from '../services/webhook';
import { saveToLocalStorage, getAllFromLocalStorage, deleteFromLocalStorage } from '../services/localStorage';

const CommitmentForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'form' | 'results'>('form');
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    submittedAt: ''
  });
  
  const [signature, setSignature] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [savedForms, setSavedForms] = useState<Record<string, FormData>>({});

  const commitmentText = `Dengan Rahmat Tuhan yang maha Kuasa

Pada hari ini, ${new Date().toLocaleDateString('id-ID', { 
  day: 'numeric', 
  month: 'long', 
  year: 'numeric' 
})} dalam hal ini kami bertindak sebagai diri kami sendiri dan pegawai bank jatim berkomitmen untuk menjadi pegawai militan dengan cara:

1. Menjadikan budaya perusahaan (EXPRESI) sebagai landasan dalam bersikap dan berperilaku
2. Mendukung setiap program dan strategi manajemen sehingga target perusahaan bisa tercapai
3. Melibatkan diri dalam program pengembangan dan transformasi perusahaan
4. Melakukan dan menerapkan cara baru untuk meningkatkan hasil dan perbaikan proses kerja
5. Membangun Kerja sama tim agar menumbuhkan keinginan untuk menemukan inovasi dalam melakukan perbaikan kinerja
6. Mendorong Budaya Kerja (EXPRESI) yang berorientasi pada perbaikan secara berkelanjutan untuk meningkatkan kepuasan pelanggan dan kinerja
7. Menjaga nama baik dan menjunjung tinggi martabat serta kehormatan Bank
8. Memahami perilaku yang harus dilakukan (kewajiban) dan menjauhi perilaku yang tidak boleh dilakukan (larangan) sebagai pekerja bank jatim
9. Melaporkan jika ditemukan adanya benturan kepentingan sesuai dengan ketentuan internal yang berlaku
10. Dilarang menerima atau meminta gratifikasi yang dianggap suap baik langsung maupun tidak langsung dari pihak manapun dalam rangka mempengaruhi kebijakan/keputusan/perilaku pejabat dan pekerja bank sesuai jabatan wewenang dan tanggung jawab yang dimiliki

Demikian komitmen ini kami buat dengan sebenar-benarnya dan akan kami lakukan dengan sungguh-sungguh`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignatureChange = (signatureData: string) => {
    setSignature(signatureData);
  };

  const validateForm = (): boolean => {
    const requiredFields = ['fullName', 'position'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof FormData]) {
        setStatusMessage(`Field ${field} harus diisi`);
        setSubmitStatus('error');
        return false;
      }
    }

    if (!signature) {
      setStatusMessage('Tanda tangan digital harus diisi');
      setSubmitStatus('error');
      return false;
    }

    return true;
  };

  const loadSavedForms = () => {
    const forms = getAllFromLocalStorage();
    setSavedForms(forms);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setStatusMessage('');

    try {
      // Upload signature to ImgBB
      setStatusMessage('Mengupload tanda tangan...');
      const signatureUrl = await uploadToImgBB(signature);
      
      // Prepare final form data
      const finalData: FormData = {
        ...formData,
        signatureUrl,
        submittedAt: new Date().toISOString()
      };

      // Save to localStorage
      setStatusMessage('Menyimpan data lokal...');
      const localId = saveToLocalStorage(finalData);

      // Send to webhook
      setStatusMessage('Mengirim data...');
      await sendToWebhook({
        ...finalData,
        id: localId,
        localStorageKey: localId
      });

      setSubmitStatus('success');
      setStatusMessage('Form berhasil dikirim! Data telah disimpan secara lokal dan dikirim ke server.');
      
      // Refresh page after successful submission
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setStatusMessage(`Gagal mengirim form: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadPDF = () => {
    // This would implement PDF generation - for now just show placeholder
    setStatusMessage('Fitur download PDF akan segera tersedia');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const deleteForm = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      if (deleteFromLocalStorage(id)) {
        loadSavedForms();
        setStatusMessage('Data berhasil dihapus');
        setTimeout(() => setStatusMessage(''), 3000);
      }
    }
  };

  // Load saved forms when switching to results tab
  React.useEffect(() => {
    if (activeTab === 'results') {
      loadSavedForms();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white text-center">
              SURAT KOMITMEN PEGAWAI
            </h1>
            <p className="text-blue-100 text-center mt-2">
              Bank Jatim - Komitmen Menjadi Pegawai Militan
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('form')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'form'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Form Komitmen
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'results'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Eye className="h-4 w-4 inline mr-2" />
                Hasil Input
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'form' ? (
            <form onSubmit={handleSubmit} className="p-8">
              {/* Commitment Text */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <div className="text-sm leading-relaxed text-gray-800 whitespace-pre-line">
                  {commitmentText}
                </div>
              </div>

              {/* Personal Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                  Data Pegawai
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                      Jabatan *
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Masukkan jabatan"
                    />
                  </div>
                </div>
              </div>

              {/* Digital Signature */}
              <div className="mb-8">
                <SignaturePad 
                  onSignatureChange={handleSignatureChange}
                  disabled={isSubmitting}
                />
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div className={`mb-4 p-4 rounded-lg flex items-center ${
                  submitStatus === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : submitStatus === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {submitStatus === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
                  {submitStatus === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
                  {submitStatus === 'idle' && <AlertCircle className="h-5 w-5 mr-2" />}
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <button
                  type="button"
                  onClick={downloadPDF}
                  disabled={isSubmitting}
                  className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download PDF
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Kirim Komitmen
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Results Tab */
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Data Komitmen yang Tersimpan
                </h2>
                <p className="text-gray-600 text-sm">
                  Berikut adalah daftar komitmen yang telah disubmit dan tersimpan di browser lokal.
                </p>
              </div>

              {Object.keys(savedForms).length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data</h3>
                  <p className="text-gray-500">
                    Belum ada komitmen yang disubmit. Silakan isi form terlebih dahulu.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(savedForms).map(([id, form]) => (
                    <div key={id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{form.fullName}</h3>
                          <p className="text-sm text-gray-600">{form.position}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {new Date(form.submittedAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <button
                            onClick={() => deleteForm(id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Hapus data"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Status:</span>
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Terkirim
                          </span>
                        </div>
                      </div>

                      {form.signatureUrl && (
                        <div className="mt-4">
                          <span className="font-medium text-gray-700 text-sm">Tanda Tangan:</span>
                          <div className="mt-2 p-2 bg-white rounded border">
                            <img 
                              src={form.signatureUrl} 
                              alt="Tanda tangan digital" 
                              className="max-h-20 mx-auto"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Status Message for Results Tab */}
              {statusMessage && (
                <div className="mt-4 p-4 rounded-lg flex items-center bg-blue-50 text-blue-700 border border-blue-200">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            © 2025 Bank Jatim. Sistem Komitmen Pegawai Digital.
          </p>
          <p className="text-xs mt-1">
            Data akan disimpan secara aman dan dikirim melalui sistem terintegrasi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommitmentForm;