// Firebase diagnostic tool
export async function diagnoseFirebase() {
    console.log('--- Firebase Diagnosis ---');

    // 1. Check if env variables are present
    const config = {
        apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    };

    console.log('Configuration Presence:', config);

    if (!config.apiKey || !config.authDomain || !config.projectId) {
        return {
            success: false,
            message: 'Firebase configuration is incomplete. Check your .env.local file.'
        };
    }

    // 2. Test connectivity to Google Identity Toolkit
    try {
        console.log('Testing connectivity to Google Identity Toolkit...');
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
            method: 'POST',
            body: JSON.stringify({ returnSecureToken: true }),
        });

        // We expect a 400 because we are not sending valid data, but reaching the server is what matters
        console.log('Network reachability status:', response.status);

        if (response.status === 200 || response.status === 400) {
            return {
                success: true,
                message: 'Firebase services are reachable.'
            };
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Reachability Error:', error);
        return {
            success: false,
            message: `Network error: ${errorMessage}. This might be due to an ad-blocker, VPN, or firewall.`
        };
    }

    return {
        success: false,
        message: 'Unable to determine connectivity status.'
    };
}
