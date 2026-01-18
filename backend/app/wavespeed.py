import httpx
import asyncio
from typing import Optional, Dict, Any
from app.config import settings


class WaveSpeedClient:
    """Async client for WaveSpeed API"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.wavespeed.ai/api/v3"
        self.timeout = httpx.Timeout(30.0, connect=10.0)
    
    async def create_edit_task(
        self,
        image_url: str,
        prompt: str,
        resolution: str = "8k",
        aspect_ratio: str = "1:1",
        enable_base64_output: bool = False,
        enable_sync_mode: bool = False
    ) -> Dict[str, Any]:
        """Create an edit task and return request_id"""
        url = f"{self.base_url}/google/nano-banana-pro/edit-ultra"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }
        payload = {
            "aspect_ratio": aspect_ratio,
            "enable_base64_output": enable_base64_output,
            "enable_sync_mode": enable_sync_mode,
            "images": [image_url],
            "output_format": "jpeg",
            "prompt": prompt,
            "resolution": resolution
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()["data"]
            return result
    
    async def get_prediction_result(self, request_id: str) -> Dict[str, Any]:
        """Get prediction result by request_id"""
        url = f"{self.base_url}/predictions/{request_id}/result"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            result = response.json()["data"]
            return result
    
    async def poll_for_completion(
        self,
        request_id: str,
        max_poll_attempts: int = 300,
        poll_interval: float = 1.0
    ) -> Dict[str, Any]:
        """Poll for task completion and return final result"""
        for attempt in range(max_poll_attempts):
            result = await self.get_prediction_result(request_id)
            status = result.get("status")
            
            if status == "completed":
                return result
            elif status == "failed":
                error = result.get("error", "Unknown error")
                raise Exception(f"WaveSpeed task failed: {error}")
            
            # Still processing
            await asyncio.sleep(poll_interval)
        
        raise Exception("WaveSpeed task timed out")


def get_wavespeed_client() -> WaveSpeedClient:
    return WaveSpeedClient(api_key=settings.wavespeed_api_key)
