import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Search, UserCheck } from 'lucide-react';
import { useAllUsers, useUserRole, useUpdateUserRole } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const AdminPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: currentUserRole } = useUserRole();
  const { data: allUsers } = useAllUsers();
  const updateUserRole = useUpdateUserRole();
  const { toast } = useToast();

  if (currentUserRole?.role !== 'ADMINISTRADOR') {
    return (
      <div className="text-center py-8">
        <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
        <p className="text-muted-foreground">Apenas administradores podem acessar este painel.</p>
      </div>
    );
  }

  const filteredUsers = allUsers?.filter(user =>
    user.id?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleRoleChange = async (userId: string, newRole: 'ADMINISTRADOR' | 'EDITOR' | 'USUARIO') => {
    try {
      await updateUserRole.mutateAsync({ userId, newRole });
      toast({
        title: "Sucesso",
        description: `Role do usuário alterada para ${newRole}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar papel do usuário",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMINISTRADOR':
        return 'default';
      case 'EDITOR':
        return 'secondary';
      case 'USUARIO':
      default:
        return 'outline';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMINISTRADOR':
        return 'Administrador';
      case 'EDITOR':
        return 'Editor';
      case 'USUARIO':
      default:
        return 'Usuário';
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
                      <p className="font-medium">{user.id}</p>
                      <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                    </div>
                    <Badge variant={getRoleBadgeVariant(user.role || 'USUARIO')}>
                      {getRoleDisplayName(user.role || 'USUARIO')}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={user.role || 'USUARIO'}
                    onValueChange={(newRole: 'ADMINISTRADOR' | 'EDITOR' | 'USUARIO') => 
                      handleRoleChange(user.id, newRole)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USUARIO">Usuário</SelectItem>
                      <SelectItem value="EDITOR">Editor</SelectItem>
                      <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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