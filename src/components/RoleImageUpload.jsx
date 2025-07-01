import React,{useState} from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {useAuth} from '../contexts/AuthContext';

const {FiUpload,FiImage,FiCheck,FiX}=FiIcons;

const RoleImageUpload=({roleId,currentImageUrl,onImageUploaded})=> {
  const {hasPermission,uploadRoleImage,loadRoleImages}=useAuth();
  const [uploading,setUploading]=useState(false);
  const [dragOver,setDragOver]=useState(false);

  if (!hasPermission('canUploadRoleImages')) {
    return null;
  }

  const handleFileUpload=async (file)=> {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPEG, WebP)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5242880) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const imageUrl=await uploadRoleImage(roleId,file);
      
      // 🔥 RELOAD IMAGES AND TRIGGER CALLBACK
      await loadRoleImages();
      
      if (onImageUploaded) {
        onImageUploaded(imageUrl);
      }

      // 🔥 FORCE REFRESH TO SHOW NEW IMAGE
      setTimeout(()=> {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error uploading image:',error);
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop=(e)=> {
    e.preventDefault();
    setDragOver(false);
    const files=Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInput=(e)=> {
    const files=Array.from(e.target.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="relative">
      <div
        onDrop={handleDrop}
        onDragOver={(e)=> {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={()=> setDragOver(false)}
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
          dragOver
            ? 'border-blue-400 bg-blue-900/20'
            : 'border-midnight-600 hover:border-midnight-500'
        }`}
      >
        {currentImageUrl ? (
          <div className="space-y-2">
            <img
              src={currentImageUrl}
              alt="Role"
              className="w-16 h-16 mx-auto rounded-lg object-cover"
              onError={(e)=> {
                console.log('Image failed to load:',currentImageUrl);
                e.target.style.display='none';
              }}
            />
            <p className="text-midnight-300 text-sm">Current role image</p>
          </div>
        ) : (
          <div className="space-y-2">
            <SafeIcon icon={FiImage} className="w-8 h-8 text-midnight-400 mx-auto" />
            <p className="text-midnight-400 text-sm">No image uploaded</p>
          </div>
        )}

        <div className="mt-3">
          <label
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
              uploading
                ? 'bg-midnight-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {uploading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <SafeIcon icon={FiUpload} className="w-4 h-4" />
                <span>Upload Image</span>
              </>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileInput}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        <p className="text-midnight-500 text-xs mt-2">
          PNG, JPEG, WebP up to 5MB
        </p>
      </div>
    </div>
  );
};

export default RoleImageUpload;