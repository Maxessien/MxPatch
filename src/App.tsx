import { invoke } from "@tauri-apps/api/core"
import { open } from "@tauri-apps/plugin-dialog"
import { useState } from "react"
import { toast, ToastContainer } from "react-toastify"

const App = () => {
  const [files, setFiles] = useState<{
    patchBinary: string | null,
    oldFileBinary: string | null
  }>({
    patchBinary: null,
    oldFileBinary: null
  })

  const createPatchedFile = async () => {
    if (!files.oldFileBinary || !files.patchBinary) return
    try {
      await invoke("patch_bins", { patch: files.patchBinary, old: files.oldFileBinary })
      toast.success("Patch succesful")
    } catch(err) {
      console.log(err)
      toast.error("Patch fail")
    }
  }

  const selectFile = async (type: "patch" | "old") => {
    try {
      const path = await open({
        multiple: false, directory: false
      })

      type === "patch" && path ?
        setFiles(p => ({ ...p, patchBinary: path })) :
        setFiles(p => ({ ...p, oldFileBinary: path }))
    } catch (err) {
      console.log(err)
      toast.error("Couldn't select file")
    }
  }

  const isReady = files.patchBinary && files.oldFileBinary

  return (
    <>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans selection:bg-cyan-500/30">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-lg bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r border-b border-transparent from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              MxPath
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Select files to compile your patch matrix
            </p>
          </div>

          {/* Form Matrix */}
          <div className="space-y-4">

            {/* Old File Selector */}
            <div className="group relative">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Original File (Old)
              </label>
              <button
                onClick={() => selectFile("old")}
                className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                  files.oldFileBinary
                    ? "bg-slate-800/50 border-cyan-500/40 text-slate-200"
                    : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-500"
                }`}
              >
                <span className="truncate text-sm font-medium pr-4">
                  {files.oldFileBinary ? files.oldFileBinary.split(/[/\\]/).pop() : "Choose source binary..."}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-colors shrink-0">
                  Browse
                </span>
              </button>
              {files.oldFileBinary && (
                <p className="text-[10px] text-slate-500 mt-1.5 truncate px-1">
                  Full path: {files.oldFileBinary}
                </p>
              )}
            </div>

            {/* Patch File Selector */}
            <div className="group relative">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Patch File
              </label>
              <button
                onClick={() => selectFile("patch")}
                className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                  files.patchBinary
                    ? "bg-slate-800/50 border-indigo-500/40 text-slate-200"
                    : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-500"
                }`}
              >
                <span className="truncate text-sm font-medium pr-4">
                  {files.patchBinary ? files.patchBinary.split(/[/\\]/).pop() : "Choose patch target..."}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-colors shrink-0">
                  Browse
                </span>
              </button>
              {files.patchBinary && (
                <p className="text-[10px] text-slate-500 mt-1.5 truncate px-1">
                  Full path: {files.patchBinary}
                </p>
              )}
            </div>

          </div>

          {/* Submit Action */}
          <div className="mt-8">
            <button
              onClick={createPatchedFile}
              disabled={!isReady}
              className={`w-full py-4 px-6 rounded-xl font-semibold tracking-wide text-sm transition-all duration-300 transform ${
                isReady
                  ? "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20 active:scale-[0.99] cursor-pointer"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
              }`}
            >
              {isReady ? "Execute Binary Patch" : "Awaiting File Selection"}
            </button>
          </div>

        </div>
      </div>

      <ToastContainer closeButton draggable newestOnTop theme="colored" position="top-center" pauseOnHover />
    </>
  )
}

export default App
