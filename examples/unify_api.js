import { BundleUp } from '../dist/index.js';

const apiKey = process.env.BUNDLEUP_API_KEY;
const connectionId = process.env.BUNDLEUP_CONNECTION_ID;

if (!apiKey) {
  throw new Error('BUNDLEUP_API_KEY is required');
}

if (!connectionId) {
  throw new Error('BUNDLEUP_CONNECTION_ID is required for unify example');
}

const client = new BundleUp(apiKey);
const unify = client.unify(connectionId);

console.log('Unify API example');

try {
  const users = await unify.chat.users({ limit: 10 });
  console.log(`Chat users: ${users.data?.length ?? 0}`);
} catch (error) {
  console.error(`Failed to fetch chat users: ${error.message}`);
}

try {
  const channels = await unify.chat.channels({ limit: 10 });
  console.log(`Chat channels: ${channels.data?.length ?? 0}`);

  const [channel] = channels.data ?? [];

  if (channel) {
    const messages = await unify.chat.messages(channel.id, { limit: 10 });
    console.log(`Messages in ${channel.name}: ${messages.data?.length ?? 0}`);
  }
} catch (error) {
  console.error(`Failed to fetch chat channels: ${error.message}`);
}

try {
  const repos = await unify.git.repos({ limit: 10 });
  console.log(`Git repos: ${repos.data?.length ?? 0}`);
} catch (error) {
  console.error(`Failed to fetch git repos: ${error.message}`);
}

try {
  const tickets = await unify.ticketing.tickets({ limit: 10 });
  console.log(`Ticketing tickets: ${tickets.data?.length ?? 0}`);

  const [first] = tickets.data ?? [];

  if (first) {
    const ticket = await unify.ticketing.ticket(first.id);
    console.log(`Ticket ${ticket.data.id}: ${ticket.data.title}`);
  }
} catch (error) {
  console.error(`Failed to fetch tickets: ${error.message}`);
}

try {
  const companies = await unify.crm.companies({ limit: 10 });
  console.log(`CRM companies: ${companies.data?.length ?? 0}`);
} catch (error) {
  console.error(`Failed to fetch CRM companies: ${error.message}`);
}

try {
  const files = await unify.drive.files({ limit: 10 });
  console.log(`Drive files: ${files.data?.length ?? 0}`);
} catch (error) {
  console.error(`Failed to fetch Drive files: ${error.message}`);
}

try {
  const events = await unify.calendar.events({
    starts_after: new Date().toISOString(),
    starts_before: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    limit: 10,
  });
  console.log(`Calendar events: ${events.data?.length ?? 0}`);
} catch (error) {
  console.error(`Failed to fetch Calendar events: ${error.message}`);
}
