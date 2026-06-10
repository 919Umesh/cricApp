import "server-only";
import {
  Account,
  Client,
  Storage,
  TablesDB,
  Users,
} from "node-appwrite";
import { appwriteConfig } from "./config";

function baseClient(): Client {
  return new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);
}

/**
 * Privileged client authenticated with the server API key. Used by data
 * services, server actions and the content pipeline. Never expose to the
 * browser.
 */
export function createAdminClient() {
  const client = baseClient().setKey(appwriteConfig.apiKey);
  return {
    client,
    tables: new TablesDB(client),
    storage: new Storage(client),
    users: new Users(client),
    account: new Account(client),
  };
}

/** Client bound to a user session secret (from the auth cookie). */
export function createSessionClient(sessionSecret: string) {
  const client = baseClient().setSession(sessionSecret);
  return {
    client,
    account: new Account(client),
  };
}

/** Anonymous client — used only to create email/password sessions. */
export function createAnonymousClient() {
  const client = baseClient();
  return {
    client,
    account: new Account(client),
  };
}
