// Script para criar usuário de teste
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://fnanvlzrdlkfbwyowdve.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYW52bHpyZGxrZmJ3eW93ZHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjg3MTksImV4cCI6MjA2OTk0NDcxOX0.zJtHu_OAVQiCosrj3xhUSxzXEVa-DoL2Vvh6pIBIXcE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function criarUsuarioTeste() {
  try {
    console.log('🚀 Criando usuário de teste...');
    
    const email = 'teste@crm.com';
    const password = '123456';
    
    // Tentar fazer signup
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ Usuário já existe, tentando fazer login...');
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });
        
        if (loginError) {
          console.error('❌ Erro no login:', loginError.message);
          return;
        }
        
        console.log('✅ Login realizado com sucesso!');
        console.log('📧 Email:', email);
        console.log('🔑 Senha:', password);
        return loginData;
      } else {
        console.error('❌ Erro ao criar usuário:', error.message);
        return;
      }
    }
    
    console.log('✅ Usuário criado com sucesso!');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    console.log('⚠️  Verifique seu email para confirmar a conta (se necessário)');
    
    return data;
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o script
criarUsuarioTeste();

module.exports = { criarUsuarioTeste };