

import React from 'react'
import { RefreshCw } from 'lucide-react';


const RefreashBtn = ({refetch}) => {
  return (
    <button
                             onClick={() => refetch()}
                             className="flex items-center gap-2 px-4 py-2 border border-border-strong rounded-lg text-text-body hover:bg-bg-subtle transition-colors hover:text-accent/70"
                        >
                             <RefreshCw size={18} />
                        </button>
  )
}

export default RefreashBtn
