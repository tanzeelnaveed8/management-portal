
import React from 'react'

const FailedLoading = ({ refetch, error }) => {
  return (
       <div className="flex h-screen items-center justify-center bg-bg-page p-6">
            <div className="text-center max-w-md">
                 <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                 <h2 className="text-xl font-bold text-text-primary mb-2">Failed to Load Dashboard</h2>
                 <p className="text-text-muted mb-6">{error}</p>
                 <button
                      onClick={() => refetch()}
                      className="bg-accent text-text-inverse px-6 py-3 rounded-xl font-bold hover:bg-accent-hover transition-all"
                 >
                      Retry
                 </button>
            </div>
       </div>
  )
}

export default FailedLoading
