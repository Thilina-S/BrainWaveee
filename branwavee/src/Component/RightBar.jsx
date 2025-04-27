import Message from './Message';

 // Fix typo here

export default function RightBar() {
  return (
    <div className="w-72 bg-white p-4 shadow-md hidden lg:block">
      <div className="space-y-4">
        <Message />
      
      </div>
    </div>
  );
}
