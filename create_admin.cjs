// Script para criar usuário administrador
// Execute com: node create_admin.cjs

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fnanvlzrdlkfbwyowdve.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYW52bHpyZGxrZmJ3eW93ZHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjg3MTksImV4cCI6MjA2OTk0NDcxOX0.zJtHu_OAVQiCosrj3xhUSxzXEVa-DoL2Vvh6pIBIXcE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  try {
    console.log('=== CRIANDO USUÁRIO ADMINISTRADOR ===\n');
    
    // Verificar se o usuário já existe
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@mde.com',
      password: 'admin123456'
    });
    
    if (loginData?.user) {
      console.log('✅ Usuário admin@mde.com já existe!');
      console.log('ID do usuário:', loginData.user.id);
      console.log('Email confirmado:', loginData.user.email_confirmed_at ? 'Sim' : 'Não');
      
      // Verificar se o perfil existe
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', loginData.user.id)
        .single();
      
      if (profileData) {
        console.log('✅ Perfil encontrado:', profileData);
      } else {
        console.log('⚠️  Perfil não encontrado, criando...');
        
        // Criar perfil básico (sem role por enquanto)
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: loginData.user.id,
            email: loginData.user.email,
            nome_completo: 'Administrador do Sistema'
          })
          .select();
        
        if (createError) {
          console.log('❌ Erro ao criar perfil:', createError.message);
        } else {
          console.log('✅ Perfil criado:', newProfile);
        }
      }
      
      await supabase.auth.signOut();
    } else {
      console.log('Usuário não existe, criando...');
      
      // Registrar novo usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'admin@mde.com',
        password: 'admin123456'
      });
      
      if (authError) {
        console.error('❌ Erro ao criar usuário:', authError.message);
        return;
      }
      
      if (authData.user) {
        console.log('✅ Usuário criado com sucesso!');
        console.log('ID do usuário:', authData.user.id);
        console.log('Email:', authData.user.email);
        
        // Aguardar um pouco para o trigger criar o perfil
        console.log('⏳ Aguardando criação automática do perfil...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Verificar se o perfil foi criado automaticamente
        const { data: profileCheck, error: profileCheckError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        if (profileCheck) {
          console.log('✅ Perfil criado automaticamente:', profileCheck);
        } else {
          console.log('⚠️  Perfil não foi criado automaticamente, criando manualmente...');
          
          // Criar perfil manualmente
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: authData.user.email,
              nome_completo: 'Administrador do Sistema'
            })
            .select();
          
          if (createError) {
            console.log('❌ Erro ao criar perfil:', createError.message);
          } else {
            console.log('✅ Perfil criado manualmente:', newProfile);
          }
        }
      }
    }
    
    console.log('\n=== CREDENCIAIS DO ADMINISTRADOR ===');
    console.log('Email: admin@mde.com');
    console.log('Senha: admin123456');
    console.log('Status: Usuário criado com sucesso!');
    console.log('\n⚠️  IMPORTANTE:');
    console.log('1. Para ativar as permissões de administrador, você precisa aplicar a migração do banco de dados.');
    console.log('2. Acesse o Dashboard do Supabase > SQL Editor');
    console.log('3. Execute o conteúdo do arquivo: supabase/migrations/20250115000000_implement_crm_permissions.sql');
    console.log('4. Depois execute: UPDATE profiles SET role = \'ADMINISTRADOR\' WHERE email = \'admin@mde.com\';');
    console.log('=====================================\n');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

createAdminUser();