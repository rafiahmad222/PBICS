import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Download, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ReportModal = ({ isOpen, onClose, data, type = 'patient' }) => {
    const reportRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!isOpen) return null;

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;

        setIsDownloading(true);

        try {
            const originalNode = reportRef.current;
            const clone = originalNode.cloneNode(true);

            // Ensure images have crossOrigin attribute for html2canvas
            const images = clone.querySelectorAll('img');
            images.forEach(img => {
                img.crossOrigin = 'anonymous';
            });

            // Append clone to body to ensure it can be rendered (off-screen)
            clone.style.position = 'absolute';
            clone.style.left = '-9999px';
            clone.style.top = '0';
            clone.style.width = `${originalNode.offsetWidth}px`; // Maintain width
            clone.style.background = '#ffffff';
            document.body.appendChild(clone);

            // Generate Canvas from the clone
            const canvas = await html2canvas(clone, {
                scale: 2,
                logging: false,
                backgroundColor: '#ffffff',
                useCORS: true,
                allowTaint: false
            });

            // Clean up clone
            document.body.removeChild(clone);

            // Generate PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Medical_Report_${data?.patientDetails?.name || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert(`Failed to generate PDF: ${error.message}`);
        } finally {
            setIsDownloading(false);
        }
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="p-6 border-b border-secondary-dark/10 flex justify-between items-center bg-secondary-light/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-primary">Medical Report</h3>
                            <p className="text-sm text-primary-light">Generated on {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-secondary-dark/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-primary-light" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto" ref={reportRef}>
                    {type === 'patient' && data ? (
                        <div className="space-y-6">
                            <div className="flex justify-between border-b border-[#e5e7eb] pb-6">
                                <div>
                                    <h4 className="text-sm font-bold text-[#6b7280] uppercase tracking-wider mb-1">Treatment</h4>
                                    <p className="text-lg font-bold text-[#1B4D3E]">{data.treatment}</p>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-sm font-bold text-[#6b7280] uppercase tracking-wider mb-1">Date</h4>
                                    <p className="text-[#1B4D3E] font-medium">{data.date}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-sm font-bold text-[#6b7280] uppercase tracking-wider mb-2">Specialist</h4>
                                    <p className="text-[#1B4D3E] font-medium">{data.specialist}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-[#6b7280] uppercase tracking-wider mb-2">Patient ID</h4>
                                    <p className="text-[#1B4D3E] font-medium">{data.patientDetails?.id || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="bg-[#F9F9EA] p-4 rounded-xl border border-[#e5e7eb]">
                                <h4 className="text-sm font-bold text-[#1B4D3E] uppercase tracking-wider mb-2">Clinical Notes</h4>
                                <p className="text-[#113329] leading-relaxed text-sm">
                                    {data.notes || 'No notes available for this session.'}
                                </p>
                            </div>

                            {/* Images if available */}
                            {data.beforeImage && data.afterImage && (
                                <div>
                                    <h4 className="text-sm font-bold text-[#6b7280] uppercase tracking-wider mb-3">Treatment Photos</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-[#6b7280] mb-1">Before</p>
                                            <img
                                                src={data.beforeImage}
                                                alt="Before"
                                                crossOrigin="anonymous"
                                                className="w-full aspect-square object-cover rounded-lg border border-[#e5e7eb]"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#6b7280] mb-1">After</p>
                                            <img
                                                src={data.afterImage}
                                                alt="After"
                                                crossOrigin="anonymous"
                                                className="w-full aspect-square object-cover rounded-lg border border-[#e5e7eb]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-primary-light">Full Analytics Report implementation would go here.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-secondary-dark/10 bg-secondary-light/30 flex justify-end gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-secondary-dark/20 rounded-lg text-primary font-medium hover:bg-white transition-colors">
                        <Printer className="w-4 h-4" /> Print
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-secondary rounded-lg font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isDownloading ? (
                            <>Generating...</>
                        ) : (
                            <>
                                <Download className="w-4 h-4" /> Download PDF
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    , document.body);
};

export default ReportModal;
