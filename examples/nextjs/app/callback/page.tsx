import { BundleUp } from "@bundleup/sdk";

const client = new BundleUp(process.env.BUNDLEUP_API_KEY!);

interface PageProps {
  searchParams: Promise<{
    error?: string;
    error_description?: string;
    connection_id: string;
  }>;
}

export default async function Callback({ searchParams }: PageProps) {
  const { connection_id, error, error_description } = await searchParams;

  if (error) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-red-600">Error: {error_description}</p>
      </div>
    );
  }

  const channels = await client.unify(connection_id).chat.channels();

  return (
    <div className="flex items-center justify-center p-4">
      <p className="text-green-600">
        Successfully connected! Here are your chat channels:
        <ul>
          {channels.data.map((channel) => (
            <li key={channel.id}>{channel.name}</li>
          ))}
        </ul>
      </p>
    </div>
  );
}
