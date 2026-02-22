import jwt from 'jsonwebtoken';

const authSeller = async (req, res, next) => {
    // Get token from cookies
    const { sellerToken } = req.cookies || {}; 

    if (!sellerToken) {
        return res.json({ success: false, message: 'Not Authorized: No Token' });
    }

    try {
        const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET);

        // 1. EXTRACTION: Using the new logic to find the hex ID
        if (tokenDecode.id) {
            req.body.sellerId = tokenDecode.id; // This will now be the valid hex ID
            next();
        } else {
            return res.json({ success: false, message: 'Invalid Token' });
        }

    } catch (error) {
        console.log("Auth Error:", error.message);
        res.json({ success: false, message: error.message });
    }
}

export default authSeller;