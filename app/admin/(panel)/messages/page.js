import MessageList from "@/components/admin/MessageList";

export const metadata = { title: "Messages · Daily" };

export default function MessagesAdminPage() {
  return (
    <>
      <h1 className="page-title small-title">Messages</h1>
      <p className="muted page-intro">What people sent through the contact form on your site, newest first.</p>
      <MessageList />
    </>
  );
}
