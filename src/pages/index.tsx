import FileUpload from "../components/file-upload";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <h1 className="text-2xl font-bold mb-6">CSV File Uploader</h1>
      <FileUpload />
    </main>
  )
}

