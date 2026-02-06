from supabase import create_client, Client
from config import settings

class Database:
    def __init__(self):
        self.client: Client = None
    
    async def connect(self):
        """Create Supabase client connection"""
        try:
            self.client = create_client(
                settings.supabase_url,
                settings.supabase_key
            )
            print("✅ Supabase client initialized successfully")
        except Exception as e:
            print(f"❌ Error connecting to Supabase: {e}")
            raise
    
    async def disconnect(self):
        """Close Supabase connection"""
        print("✅ Supabase client closed")

# Global database instance
db = Database()
