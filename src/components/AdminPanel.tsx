import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Search, UserCheck } from 'lucide-react';
import { useAllUsers, useUserRole } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const AdminPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: currentUserRole } = useUserRole();
  const { data: allUsers, refetch } = useAllUsers();
  const { toast } = useToast();

  if (currentUserRole?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
        <p className="text-muted-foreground">Apenas administradores podem acessar este painel.</p>
      </div>
    );
  }

  const filteredUsers = allUsers?.filter(user =>
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const toggleUserRole = async (userId: string, currentRole: 'admin' | 'user') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      await refetch();
      toast({
        title: "Sucesso",
        description: `Usuário ${newRole === 'admin' ? 'promovido a' : 'removido de'} administrador`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar papel do usuário",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Painel Administrativo</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciar Usuários
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{user.display_name || 'Sem nome'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant={user.user_roles?.[0]?.role === 'admin' ? 'default' : 'secondary'}>
                      {user.user_roles?.[0]?.role === 'admin' ? 'Admin' : 'Usuário'}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleUserRole(user.user_id, (user.user_roles?.[0]?.role as 'admin' | 'user') || 'user')}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  {user.user_roles?.[0]?.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                </Button>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};