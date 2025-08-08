const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://fnanvlzrdlkfbwyowdve.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYW52bHpyZGxrZmJ3eW93ZHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjg3MTksImV4cCI6MjA2OTk0NDcxOX0.zJtHu_OAVQiCosrj3xhUSxzXEVa-DoL2Vvh6pIBIXcE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createIgorAdmin() {
  try {
    console.log('Criando usuário igor.gregio44@gmail.com...');
    
    // Primeiro, tenta fazer login para verificar se o usuário já existe
    const { data: existingUser, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'igor.gregio44@gmail.com',
      password: 'admin123456'
    });
    
    if (loginError && loginError.message.includes('Invalid login credentials')) {
      // Usuário não existe, vamos criar
      console.log('Usuário não encontrado, criando novo usuário...');
      
      const { data: newUser, error: signUpError } = await supabase.auth.signUp({
        email: 'igor.gregio44@gmail.com',
        password: 'admin123456'
      });
      
      if (signUpError) {
        console.error('Erro ao criar usuário:', signUpError.message);
        return;
      }
      
      console.log('Usuário criado com sucesso! ID:', newUser.user?.id);
    } else if (existingUser) {
      console.log('Usuário já existe! ID:', existingUser.user?.id);
      
      // Fazer logout após verificação
      await supabase.auth.signOut();
    } else {
      console.error('Erro inesperado:', loginError);
      return;
    }
    
    console.log('\n✅ Igor Gregio criado/verificado com sucesso!');
    console.log('📧 Email: igor.gregio44@gmail.com');
    console.log('🔑 Senha: admin123456');
    console.log('\n⚠️  IMPORTANTE: Para definir como administrador, você precisará:');
    console.log('1. Aplicar a migração do banco de dados no Supabase');
    console.log('2. Executar o SQL para definir a role de administrador');
    console.log('3. O sistema de gerenciamento de usuários estará disponível no painel admin');
    
  } catch (error) {
    console.error('Erro geral:', error.message);
  }
}

createIgorAdmin();