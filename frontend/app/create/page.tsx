import { redirect } from 'next/navigation'

// Keep older bookmarks on the same guided studio as the main navigation.
export default function CreatePage() {
  redirect('/dashboard/create')
}
