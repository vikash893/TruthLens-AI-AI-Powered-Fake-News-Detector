import dns from 'dns';
import { promisify } from 'util';
import ipaddr from 'ipaddr.js';

const lookupAsync = promisify(dns.lookup);

export interface SSRFValidationResult {
  isValid: boolean;
  error?: string;
  resolvedIp?: string;
}

export async function validateUrlForSSRF(rawUrl: string): Promise<SSRFValidationResult> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch (err) {
    return { isValid: false, error: 'Invalid URL format' };
  }

  // Reject unsupported protocols (must be http or https)
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return {
      isValid: false,
      error: `Protocol '${parsedUrl.protocol}' is prohibited. Only HTTP and HTTPS are permitted.`
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Reject obvious localhost and metadata identifiers
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.local')
  ) {
    return { isValid: false, error: 'Access to loopback or local hostnames is strictly forbidden.' };
  }

  // Resolve hostname to IP to protect against DNS rebinding and internal IP access
  try {
    const lookupResult = await lookupAsync(hostname, { all: true });
    if (!lookupResult || lookupResult.length === 0) {
      return { isValid: false, error: 'Could not resolve hostname to an IP address.' };
    }

    for (const record of lookupResult) {
      const ipStr = record.address;
      if (!ipaddr.isValid(ipStr)) {
        return { isValid: false, error: `Invalid resolved IP address: ${ipStr}` };
      }

      const addr = ipaddr.parse(ipStr);
      const range = addr.range();

      // Block dangerous network ranges
      const blockedRanges = [
        'loopback',
        'private',
        'linkLocal', // Prevents AWS/GCP 169.254.169.254 metadata attacks
        'broadcast',
        'carrierGradeNat',
        'reserved',
        'uniqueLocal'
      ];

      if (blockedRanges.includes(range)) {
        return {
          isValid: false,
          error: `Destination IP ${ipStr} falls within a restricted range (${range}). Access denied.`,
          resolvedIp: ipStr
        };
      }
    }

    return { isValid: true, resolvedIp: lookupResult[0].address };
  } catch (err: any) {
    return { isValid: false, error: `DNS resolution failed: ${err.message}` };
  }
}
