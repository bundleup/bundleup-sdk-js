export default function Home() {
  const url = `https://auth.bundleup.io/authorize?
client_id=${process.env.NEXT_PUBLIC_BUNDLEUP_CLIENT_ID}
&integration_id=${process.env.NEXT_PUBLIC_BUNDLEUP_INTEGRATION_ID}
&redirect_uri=${encodeURIComponent(`http://localhost:3000/callback`)}`;

  return (
    <div className='flex items-center justify-center p-4'>
      <a
        href={url}
        className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium'
      >
        Connect GitHub
      </a>
    </div>
  );
}
