// @ts-ignore - Deno imports
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('🔧 Starting debug-env function...');

// @ts-ignore - Deno edge function handler
serve(async (req: any) => {
  console.log('🔧 Request received:', req.method, req.url);
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    console.log('🔧 Handling CORS preflight');
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔧 Getting environment variables...');
    
    // @ts-ignore - Deno globals
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    // @ts-ignore - Deno globals
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // @ts-ignore - Deno globals
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('🔧 Environment check:');
    console.log('  - OpenAI Key:', openaiApiKey ? `${openaiApiKey.substring(0, 10)}...` : 'NOT SET');
    console.log('  - Supabase URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET');
    console.log('  - Service Key:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 10)}...` : 'NOT SET');

    const envCheck: any = {
      openai_configured: !!openaiApiKey,
      supabase_url_configured: !!supabaseUrl,
      service_key_configured: !!supabaseServiceKey,
      openai_key_preview: openaiApiKey ? `${openaiApiKey.substring(0, 10)}...` : null,
      supabase_url_preview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : null,
      timestamp: new Date().toISOString()
    };

    // Testar conectividade básica com OpenAI se a chave existir
    if (openaiApiKey) {
      console.log('🔧 Testing OpenAI connectivity...');
      try {
        const testResponse = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
          },
        });
        
        console.log('🔧 OpenAI response status:', testResponse.status);
        envCheck.openai_api_status = testResponse.ok ? 'working' : `error_${testResponse.status}`;
      } catch (openaiError) {
        console.error('🔧 OpenAI error:', openaiError);
        envCheck.openai_api_status = 'connection_failed';
        envCheck.openai_error = openaiError.message;
      }
    } else {
      console.log('🔧 No OpenAI key found');
      envCheck.openai_api_status = 'no_key';
    }

    console.log('🔧 Sending successful response...');
    
    const response = new Response(
      JSON.stringify({
        success: true,
        environment_check: envCheck
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
    console.log('🔧 Response created successfully');
    return response;
    
  } catch (error) {
    console.error('❌ Error in debug-env function:', error);
    console.error('❌ Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

console.log('🔧 Debug-env function setup complete');
