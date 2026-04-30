import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({ label, onImageChange }) => {
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImage(file);
        }
    };

    const handleImage = (file) => {
        if (file.type.startsWith('image/')) {
            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl);
            if (onImageChange) onImageChange(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleImage(file);
        }
    };

    const clearImage = (e) => {
        e.stopPropagation();
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onImageChange) onImageChange(null);
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-primary block">{label}</label>

            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
            relative w-full aspect-square rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 overflow-hidden group
            ${isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-secondary-dark/40 hover:border-primary/50 hover:bg-secondary-light/50 bg-white'
                    }
        `}
            >
                {preview ? (
                    <>
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                            onClick={clearImage}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <>
                        <div className={`p-3 rounded-full ${isDragging ? 'bg-primary/20 text-primary' : 'bg-secondary-dark/20 text-primary-light group-hover:bg-primary/10 group-hover:text-primary transition-colors'}`}>
                            <Upload className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-primary">Click or drag photo</p>
                            <p className="text-xs text-primary-light">SVG, PNG, JPG (max. 2MB)</p>
                        </div>
                    </>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default ImageUpload;
