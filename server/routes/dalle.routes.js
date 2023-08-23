import express from 'express';
import * as dotenv from 'dotenv';
import { Leap } from "@leap-ai/sdk"; // Assuming this is the correct import for the LeapAI SDK


dotenv.config();

const router = express.Router();

const leap = new Leap(process.env.LEAPAI_API_KEY);

router.route('/').get((req, res) => {
    res.status(200).json({ message: "Hello from DALL.E Routes" });
});

router.route('/').post(async (req, res) => {
    try {
        const { prompt } = req.body;

        const response = await leap.generate.generateImage({
          prompt,
          numberOfImages: 1,
          steps: 125,
          width: 1024,
          height: 1024,
        })

        res.status(200).json({photo: response.data.images[0].uri})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something Went Wrong" });
    }
});

export default router;






// const response = await fetch(`https://api.tryleap.ai/api/v1/images/models/${model_id}/inferences`, {
//             method: "POST",
//             headers: {
//                 "Authorization": `Bearer ${process.env.LEAPAI_API_KEY}`,
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 prompt,
//                 steps: 50,
//                 width: 1024,
//                 height: 1024,
//                 numberOfImages: 1,
//                 promptStrength: 7,
//                 enhancePrompt: false,
//                 restoreFaces: true,
//                 upscaleBy: "x1",
//             }),
//         });

//         const json = await response.json();

//         return res.status(202).json({ photo: json });