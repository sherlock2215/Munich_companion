const LocationPermissionRequest = ({ onGrant, onDeny }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Locate className="text-blue-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Enable Location</h3>
            <p className="text-slate-600 mb-4 text-sm">
                Allow MunichConnect to access your location to show nearby places and groups.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={onDeny}
                    className="flex-1 py-2 px-4 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    Not Now
                </button>
                <button
                    onClick={onGrant}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Allow
                </button>
            </div>
        </div>
    </div>
);
export default LocationPermissionRequest;