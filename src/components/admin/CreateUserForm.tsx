'use client';

import * as React from 'react'; // Added React import
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import UserFormFields from './UserFormFields';
import type { User, UserRole, PermissionAction, FeatureScope, UserPermissions } from '@/types/auth';
import * as authService from '@/lib/authService'; // Using mock service
import { toast } from "@/hooks/use-toast";
import { DialogFooter, DialogClose } from '@/components/ui/dialog';

const ALL_ACTIONS_CONST: PermissionAction[] = ['view', 'create', 'edit', 'delete'];

const permissionActionSchema = z.enum(['view', 'create', 'edit', 'delete']);

const userPermissionsSchema = z.object({
  prices: z.array(permissionActionSchema).optional(),
  users: z.array(permissionActionSchema).optional(),
  announcements: z.array(permissionActionSchema).optional(),
  rfqs: z.array(permissionActionSchema).optional(),
}).default({});


const userFormSchemaBase = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["agent", "admin"], { required_error: "User role is required" }),
  permissions: userPermissionsSchema,
});

const createUserSchema = userFormSchemaBase.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const editUserSchema = userFormSchemaBase; // Password not editable here

type CreateUserFormData = z.infer<typeof createUserSchema>;
type EditUserFormData = z.infer<typeof editUserSchema>;


interface CreateUserFormProps {
  onSuccess: () => void;
  existingUser?: User | null;
}

const getDefaultPermissionsForRole = (role: UserRole): UserPermissions => {
  if (role === 'admin') {
    return {
      prices: [...ALL_ACTIONS_CONST],
      users: [...ALL_ACTIONS_CONST],
      announcements: [...ALL_ACTIONS_CONST],
      rfqs: [...ALL_ACTIONS_CONST],
    };
  }
  return { // Agent defaults
    prices: ['view'],
    users: [],
    announcements: ['view'],
    rfqs: ['view', 'create'],
  };
};


const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSuccess, existingUser }) => {
  const formSchema = existingUser ? editUserSchema : createUserSchema;
  type FormData = typeof existingUser extends User ? EditUserFormData : CreateUserFormData;

  const defaultRole: UserRole = existingUser?.role || 'agent';
  const defaultPermissions = existingUser?.permissions || getDefaultPermissionsForRole(defaultRole);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: existingUser ? {
      name: existingUser.name || '',
      email: existingUser.email,
      role: existingUser.role,
      permissions: existingUser.permissions || getDefaultPermissionsForRole(existingUser.role),
    } : {
      name: '',
      email: '',
      password: '',
      role: 'agent' as UserRole,
      permissions: getDefaultPermissionsForRole('agent'),
    },
  });
  
  const { formState: { isSubmitting }, watch, setValue } = form;
  const currentRole = watch("role");

  // Effect to update default permissions when role changes for a new user
  React.useEffect(() => {
    if (!existingUser && currentRole) { // Only for new users
      setValue("permissions", getDefaultPermissionsForRole(currentRole as UserRole), { shouldValidate: true });
    }
  }, [currentRole, existingUser, setValue]);


  const onSubmit = async (data: FormData) => {
    try {
      if (existingUser) {
        // Ensure `permissions` is part of the update payload
        await authService.updateUser(existingUser.id, data as Partial<User>);
        toast({ title: "User Updated", description: "User details have been successfully updated." });
      } else {
         // Ensure `permissions` is part of the creation payload
        await authService.createUser(data as Omit<User, 'id'>);
        toast({ title: "User Created", description: "The new user has been successfully added." });
      }
      onSuccess();
    } catch (error) {
      console.error("User form submission error:", error);
      toast({ title: existingUser ? "Update Failed" : "Creation Failed", description: "An error occurred. Please try again.", variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <UserFormFields control={form.control} isEditing={!!existingUser} />
        <DialogFooter>
          <DialogClose asChild>
             <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (existingUser ? 'Updating...' : 'Creating...') : (existingUser ? 'Save Changes' : 'Create User')}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default CreateUserForm;
