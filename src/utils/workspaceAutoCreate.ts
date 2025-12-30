import { getApiBaseUrl } from './apiBaseUrl';
import { listWorkspaces, createWorkspace } from '../components/workspace/workspaceApi';

/**
 * Extract domain from email address
 */
export function extractEmailDomain(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const emailRegex = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/;
  const match = email.match(emailRegex);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Determine workspace name based on email domain
 * - gmail.com or outlook.com -> "Personal"
 * - Other domains -> use domain name (capitalized)
 */
export function getWorkspaceNameFromDomain(domain: string): string {
  const normalizedDomain = domain.toLowerCase();
  
  // Check for personal email providers
  if (normalizedDomain === 'gmail.com' || normalizedDomain === 'outlook.com' || normalizedDomain === 'hotmail.com' || normalizedDomain === 'yahoo.com') {
    return 'Personal';
  }

  // For other domains, capitalize the domain name
  // e.g., "webring.ltd" -> "Webring"
  // Remove TLD and capitalize first letter of each part
  const parts = normalizedDomain.split('.');
  if (parts.length > 1) {
    // Remove TLD (last part)
    const domainParts = parts.slice(0, -1);
    // Capitalize each part
    const capitalized = domainParts.map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    );
    return capitalized.join(' ');
  }

  // Fallback: capitalize first letter of domain
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}

/**
 * Check if a workspace with the given name already exists for the user
 */
export async function workspaceExistsByName(
  token: string,
  workspaceName: string
): Promise<boolean> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl) {
      console.warn('[Workspace Auto-Create] No API base URL configured');
      return false;
    }

    console.log('[Workspace Auto-Create] Checking for existing workspace with name:', workspaceName);
    
    // Fetch all workspaces (or at least first page) to check for exact match
    // The search parameter might do partial matching, so we'll check all results
    const response = await listWorkspaces(token, {
      page: 1,
      pageSize: 100, // Get more results to check
      ordering: '-created_at',
    });

    console.log('[Workspace Auto-Create] Total workspaces found:', response.count);
    console.log('[Workspace Auto-Create] Workspace names:', response.results.map(w => w.name));

    // Check if any workspace matches the name exactly (case-insensitive)
    const exists = response.results.some(
      workspace => workspace.name.toLowerCase() === workspaceName.toLowerCase()
    );
    
    console.log('[Workspace Auto-Create] Workspace exists check result:', exists);
    return exists;
  } catch (error) {
    console.error('[Workspace Auto-Create] Error checking if workspace exists:', error);
    if (error instanceof Error) {
      console.error('[Workspace Auto-Create] Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    return false;
  }
}

/**
 * Auto-create workspace based on user's email domain
 * This function:
 * 1. Extracts domain from email
 * 2. Determines workspace name
 * 3. Checks if workspace already exists
 * 4. Creates workspace if it doesn't exist
 * 
 * @param token - User's access token
 * @param email - User's email address
 * @returns Created workspace or null if creation failed/skipped
 */
export async function autoCreateWorkspaceForEmail(
  token: string,
  email: string
): Promise<{ id: string; name: string } | null> {
  console.log('[Workspace Auto-Create] Starting workspace auto-creation', { email, hasToken: !!token });
  
  try {
    if (!token) {
      console.error('[Workspace Auto-Create] No access token provided');
      return null;
    }

    if (!email) {
      console.error('[Workspace Auto-Create] No email provided');
      return null;
    }

    // Extract domain from email
    const domain = extractEmailDomain(email);
    console.log('[Workspace Auto-Create] Extracted domain:', domain);
    
    if (!domain) {
      console.warn('[Workspace Auto-Create] Could not extract domain from email:', email);
      return null;
    }

    // Determine workspace name
    const workspaceName = getWorkspaceNameFromDomain(domain);
    console.log('[Workspace Auto-Create] Workspace name determined:', workspaceName);

    // Check if workspace already exists
    console.log('[Workspace Auto-Create] Checking if workspace exists...');
    const exists = await workspaceExistsByName(token, workspaceName);
    
    if (exists) {
      console.log(`[Workspace Auto-Create] Workspace "${workspaceName}" already exists, skipping creation`);
      return null;
    }

    // Create the workspace
    console.log(`[Workspace Auto-Create] Creating workspace "${workspaceName}" for domain "${domain}"`);
    try {
      const workspace = await createWorkspace(token, {
        name: workspaceName,
        category: null, // Let backend decide or use default
      });

      console.log(`[Workspace Auto-Create] ✅ Successfully created workspace:`, workspace);
      return {
        id: workspace.id,
        name: workspace.name,
      };
    } catch (createError) {
      // Check if error is due to duplicate workspace (race condition or already exists)
      const errorMessage = createError instanceof Error ? createError.message : String(createError);
      const isDuplicateError = 
        errorMessage.includes('duplicate key') ||
        errorMessage.includes('unique constraint') ||
        errorMessage.includes('already exists') ||
        errorMessage.includes('IntegrityError');

      if (isDuplicateError) {
        console.log(`[Workspace Auto-Create] Workspace "${workspaceName}" already exists (duplicate key error), fetching existing workspace...`);
        
        // Try to fetch the existing workspace
        try {
          const response = await listWorkspaces(token, {
            page: 1,
            pageSize: 100,
            ordering: '-created_at',
          });
          
          const existingWorkspace = response.results.find(
            w => w.name.toLowerCase() === workspaceName.toLowerCase()
          );
          
          if (existingWorkspace) {
            console.log(`[Workspace Auto-Create] ✅ Found existing workspace:`, existingWorkspace);
            return {
              id: existingWorkspace.id,
              name: existingWorkspace.name,
            };
          }
        } catch (fetchError) {
          console.warn('[Workspace Auto-Create] Could not fetch existing workspace:', fetchError);
        }
        
        // If we can't fetch it, that's okay - it exists, we just don't have the ID
        console.log(`[Workspace Auto-Create] Workspace "${workspaceName}" already exists, skipping creation`);
        return null;
      }
      
      // Re-throw if it's not a duplicate error
      throw createError;
    }
  } catch (error) {
    console.error('[Workspace Auto-Create] ❌ Error auto-creating workspace:', error);
    if (error instanceof Error) {
      console.error('[Workspace Auto-Create] Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    // Don't throw - this is a background operation that shouldn't block authentication
    return null;
  }
}

/**
 * Auto-create workspace for calendar email (modular function for calendar integration)
 * This function:
 * 1. Extracts domain from calendar email
 * 2. Determines workspace name (Personal for gmail/outlook, domain name for others)
 * 3. Checks if workspace already exists
 * 4. Creates workspace if it doesn't exist
 * 
 * This is designed to be called when a calendar is connected, and the workspace
 * can later be associated with meetings from that calendar.
 * 
 * @param token - User's access token
 * @param calendarEmail - Calendar email address
 * @returns Created workspace or null if creation failed/skipped
 */
export async function autoCreateWorkspaceForCalendar(
  token: string,
  calendarEmail: string
): Promise<{ id: string; name: string } | null> {
  console.log('[Workspace Auto-Create] Starting workspace auto-creation for calendar', { 
    calendarEmail, 
    hasToken: !!token 
  });
  
  // Use the same logic as email-based workspace creation
  return autoCreateWorkspaceForEmail(token, calendarEmail);
}

