import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { Loader2, Upload, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Plus } from 'lucide-react';

export const AdminGallery = () => {
  const { token, apiUrl } = useAuth();

  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState(null);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      
      const catRes = await fetch(`${apiUrl}/gallery/categories`);
      const catData = await catRes.json();
      setCategories(catData);
      if (catData.length > 0) setCategoryId(catData[0].id);

      const imgRes = await fetch(`${apiUrl}/gallery`);
      const imgData = await imgRes.json();
      const normalized = imgData.map(item => ({
        ...item,
        imageUrl: item.imageUrl || item.image || item.url || item.image_url || ''
      }));
      setImages(normalized);
    } catch (err) {
      console.error('Failed to load gallery assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, [apiUrl]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setToast({ message: 'Please select an image file to upload.', type: 'error' });
      return;
    }
    if (!categoryId) {
      setToast({ message: 'Please specify a gallery category.', type: 'error' });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category_id', categoryId);
      formData.append('title', title.trim());
      formData.append('sort_order', sortOrder);

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (err) {
              reject(new Error('Invalid response from server.'));
            }
          } else {
            try {
              const errData = JSON.parse(xhr.responseText);
              reject(new Error(errData.error || `Upload failed with status ${xhr.status}`));
            } catch (err) {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred during upload.'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted by user.'));
        });

        xhr.open('POST', `${apiUrl}/gallery`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });

      setToast({ message: 'Portfolio frame uploaded successfully!', type: 'success' });
      
      // Reset form
      setFile(null);
      setPreview('');
      setTitle('');
      setSortOrder('0');
      setUploadProgress(0);
      
      // Re-fetch images list
      fetchGalleryData();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image from your portfolio?')) return;

    try {
      const response = await fetch(`${apiUrl}/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete image.');
      }

      setToast({ message: 'Portfolio frame deleted successfully.', type: 'success' });
      setImages(prev => prev.filter(img => img.id !== id));
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  // Reorder Handler: Shift elements locally up/down
  const moveImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Redefine sort orders based on new index positions
    const reorders = updated.map((img, i) => ({
      id: img.id,
      sort_order: i + 1
    }));

    setImages(updated.map((img, i) => ({ ...img, sort_order: i + 1 })));
    applyNewOrder(reorders);
  };

  const applyNewOrder = async (reordersList) => {
    try {
      const response = await fetch(`${apiUrl}/gallery/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reorders: reordersList })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update order in database.');
      }
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-8 text-left animate-fade-in font-sans text-stone-700">
      <div className="space-y-1">
        <h1 className="text-3xl font-serif text-luxury-black uppercase tracking-wider font-bold">Gallery Manager</h1>
        <p className="text-[9px] text-stone-500 uppercase tracking-widest font-semibold font-sans">Upload and sort portfolio display</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Upload Form Block */}
        <form 
          onSubmit={handleUpload}
          className="bg-white border border-stone-200 p-6 rounded-xl space-y-5 shadow-md"
        >
          <h2 className="font-serif text-lg text-luxury-black border-b border-stone-100 pb-2 uppercase tracking-wide font-bold">Upload New Image</h2>
          
          {/* File Picker */}
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-stone-500 font-semibold">Image File</label>
            <div className="border border-dashed border-stone-300 rounded-lg p-4 bg-luxury-bg hover:bg-stone-50 transition-colors flex flex-col items-center justify-center cursor-pointer relative min-h-32 shadow-inner">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {preview ? (
                <img 
                  src={preview} 
                  alt="Upload preview" 
                  className="max-h-28 object-contain rounded"
                />
              ) : (
                <div className="text-center space-y-1.5 text-stone-400">
                  <Upload className="w-6 h-6 mx-auto stroke-[1.5]" />
                  <span className="text-xs block font-sans">Choose Image File</span>
                </div>
              )}
            </div>
          </div>

          {/* Title input */}
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-stone-500 font-semibold">Image Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Elegant Mandap Sunset"
              className="w-full bg-luxury-bg border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-850 focus:border-gold focus:outline-none shadow-inner"
            />
          </div>

          {/* Category selection */}
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-stone-500 font-semibold">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-luxury-bg border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-850 focus:border-gold focus:outline-none shadow-inner font-medium"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Sort order */}
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-stone-500 font-semibold">Sort Order Position</label>
            <input 
              type="number" 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-luxury-bg border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-850 focus:border-gold focus:outline-none shadow-inner"
            />
          </div>

          {uploading && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[9px] uppercase tracking-widest text-stone-500 font-semibold">
                <span>Uploading Progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5 border border-stone-200 overflow-hidden">
                <div 
                  className="bg-gold h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={uploading}
            className="w-full bg-luxury-black text-white font-semibold py-3 text-xs tracking-widest uppercase hover:bg-gold hover:text-luxury-black transition-colors rounded shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" /> Cataloging Image...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 shrink-0" /> Add Portfolio Frame
              </>
            )}
          </button>
        </form>

        {/* Catalog Table displaying order & deletes */}
        <div className="lg:col-span-2 bg-white border border-stone-200 p-6 rounded-xl shadow-md space-y-4">
          <h2 className="font-serif text-lg text-luxury-black border-b border-stone-100 pb-2 uppercase tracking-wide font-bold">Image Catalog List</h2>

          {loading ? (
            <div className="h-64 flex flex-col justify-center items-center text-stone-550 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
              <span className="text-[10px] uppercase tracking-widest font-semibold font-sans">Scanning files...</span>
            </div>
          ) : images.length === 0 ? (
            <div className="h-64 flex flex-col justify-center items-center text-stone-400 gap-3 border border-dashed border-stone-200 bg-luxury-bg rounded-lg">
              <ImageIcon className="w-8 h-8 text-stone-300" />
              <span className="text-[10px] uppercase tracking-widest font-semibold font-sans">No portfolio images cataloged.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs text-stone-600">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase tracking-widest text-[9px] pb-3">
                    <th className="pb-3 w-16">Preview</th>
                    <th className="pb-3 pl-4">Details</th>
                    <th className="pb-3 w-28 text-center">Sort Order</th>
                    <th className="pb-3 w-16 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {images.map((img, index) => (
                    <tr key={img.id} className="hover:bg-stone-50 transition-colors">
                      {/* Image Thumbnail */}
                      <td className="py-3.5">
                        <div className="w-12 h-12 rounded overflow-hidden bg-luxury-bg border border-stone-200 flex items-center justify-center">
                          <img 
                            src={img.imageUrl || "/placeholder.jpg"} 
                            alt="thumb" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "/placeholder.jpg";
                            }}
                          />
                        </div>
                      </td>

                      {/* Meta titles */}
                      <td className="py-3.5 pl-4 space-y-1">
                        <p className="font-semibold text-stone-850 truncate max-w-[200px]">{img.title || 'Untitled Moment'}</p>
                        <span className="text-[8px] font-bold text-gold uppercase border border-gold/25 px-2 py-0.5 rounded bg-gold/5">
                          {img.category_name}
                        </span>
                      </td>

                      {/* Sort ordering control buttons */}
                      <td className="py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => moveImage(index, -1)}
                            disabled={index === 0}
                            className="p-2 hover:bg-stone-100 rounded border border-stone-200 text-stone-500 hover:text-gold transition-colors disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <span className="w-6 font-semibold font-sans text-stone-700 text-xs">
                            {img.sort_order}
                          </span>
                          <button
                            onClick={() => moveImage(index, 1)}
                            disabled={index === images.length - 1}
                            className="p-2 hover:bg-stone-100 rounded border border-stone-200 text-stone-500 hover:text-gold transition-colors disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* Delete triggers */}
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => handleDelete(img.id)}
                          className="p-2 bg-luxury-bg hover:bg-rose-50 text-stone-400 hover:text-rose-500 border border-stone-200 hover:border-rose-350 rounded transition-all cursor-pointer shadow-sm"
                          title="Delete Frame"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Toast feedback */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AdminGallery;
