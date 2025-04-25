import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { FileGallery } from "@/components/dashboard/file-gallery"

export default async function FilesPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null // This will be handled by middleware
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Files</h1>
        <p className="text-muted-foreground">Upload and manage your files for use with AI models.</p>
      </div>

      <FileGallery />
    </div>
  )
}
