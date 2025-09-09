import React from 'react';

interface SidebarProps {
    onUploadClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onUploadClick }) => {
    return (
        <aside className="bg-white border-r-2 border-[#E1F0F5] p-6 h-screen flex flex-col shadow-lg overflow-y-auto">
            <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-[#2E7D95] to-[#4A90A4] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-4xl">
                    <i className="fas fa-user-md"></i>
                </div>
                <h3 className="text-xl font-semibold text-[#2E7D95]">Dr. MediTeach</h3>
                <p className="text-sm text-gray-500 mt-1">Your compassionate AI medical guide</p>
            </div>
            
            <div className="mb-8">
                <h4 className="font-semibold mb-3 text-[#1A2B42]">I can help with:</h4>
                <div className="flex flex-col gap-2">
                    <span className="bg-gradient-to-r from-[#E8F4F8] to-[#D1E9F0] text-sm text-[#2E7D95] px-3 py-2 rounded-full border border-[#B8DCE6]">🫀 Heart Conditions</span>
                    <span className="bg-gradient-to-r from-[#E8F4F8] to-[#D1E9F0] text-sm text-[#2E7D95] px-3 py-2 rounded-full border border-[#B8DCE6]">🧠 Neurological Issues</span>
                    <span className="bg-gradient-to-r from-[#E8F4F8] to-[#D1E9F0] text-sm text-[#2E7D95] px-3 py-2 rounded-full border border-[#B8DCE6]">🦴 Orthopedic Care</span>
                    <span className="bg-gradient-to-r from-[#E8F4F8] to-[#D1E9F0] text-sm text-[#2E7D95] px-3 py-2 rounded-full border border-[#B8DCE6]">🔬 Test Results & Procedures</span>
                </div>
            </div>
            
            <div>
                <h4 className="font-semibold mb-3 text-[#1A2B42]">📋 Upload Medical Documents</h4>
                <div className="flex flex-col gap-3">
                    <button onClick={onUploadClick} className="w-full bg-gradient-to-r from-[#F8FBFF] to-[#E8F4F8] border border-[#D1E9F0] rounded-lg p-4 text-left flex items-center gap-4 transition-all hover:border-[#2E7D95] hover:shadow-md hover:-translate-y-0.5">
                        <i className="fas fa-file-medical text-[#2E7D95] text-xl"></i>
                        <div>
                            <span className="font-semibold">Medical Reports</span>
                            <p className="text-xs text-gray-500">.pdf, .docx, .txt</p>
                        </div>
                    </button>
                    <button onClick={onUploadClick} className="w-full bg-gradient-to-r from-[#F8FBFF] to-[#E8F4F8] border border-[#D1E9F0] rounded-lg p-4 text-left flex items-center gap-4 transition-all hover:border-[#2E7D95] hover:shadow-md hover:-translate-y-0.5">
                        <i className="fas fa-x-ray text-[#2E7D95] text-xl"></i>
                        <div>
                           <span className="font-semibold">X-rays & Scans</span>
                            <p className="text-xs text-gray-500">.png, .jpg, .dcm</p>
                        </div>
                    </button>
                    <button onClick={onUploadClick} className="w-full bg-gradient-to-r from-[#F8FBFF] to-[#E8F4F8] border border-[#D1E9F0] rounded-lg p-4 text-left flex items-center gap-4 transition-all hover:border-[#2E7D95] hover:shadow-md hover:-translate-y-0.5">
                        <i className="fas fa-camera text-[#2E7D95] text-xl"></i>
                        <div>
                           <span className="font-semibold">Your Photo</span>
                           <p className="text-xs text-gray-500">For personalization</p>
                        </div>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;