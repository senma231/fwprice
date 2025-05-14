'use client';

import type { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UserRole, PermissionAction, FeatureScope } from '@/types/auth';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface UserFormFieldsProps {
  control: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  isEditing?: boolean;
}

const featureScopes: FeatureScope[] = ['prices', 'users', 'announcements', 'rfqs'];
const permissionActions: PermissionAction[] = ['view', 'create', 'edit', 'delete'];

const UserFormFields: React.FC<UserFormFieldsProps> = ({ control, isEditing = false }) => {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g., John Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <Input type="email" placeholder="user@example.com" {...field} disabled={isEditing} />
            </FormControl>
            {isEditing && <FormMessage>Email cannot be changed after creation.</FormMessage>}
            {!isEditing && <FormMessage />}
          </FormItem>
        )}
      />
      {!isEditing && (
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Set an initial password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      <FormField
        control={control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>User Role</FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                // Optionally, could trigger re-setting default permissions here if needed,
                // but currently handled in authService or form defaultValues.
              }} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />
      
      <div>
        <FormLabel className="text-lg font-semibold">Permissions</FormLabel>
        <p className="text-sm text-muted-foreground mb-4">
          Define specific actions the user can perform for each feature.
        </p>
        <div className="space-y-4">
          {featureScopes.map(scope => (
            <div key={scope} className="p-4 border rounded-md">
              <h4 className="font-medium capitalize mb-3 text-primary">{scope}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                {permissionActions.map(action => (
                  <FormField
                    key={`${scope}-${action}`}
                    control={control}
                    name={`permissions.${scope}`}
                    render={({ field }) => {
                      const isChecked = field.value?.includes(action) || false;
                      return (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                let newValue = [...(field.value || [])];
                                if (checked) {
                                  if (!newValue.includes(action)) {
                                    newValue.push(action);
                                  }
                                } else {
                                  newValue = newValue.filter(val => val !== action);
                                }
                                field.onChange(newValue.sort()); // Sort for consistency
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal capitalize text-sm">
                            {action}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
               <FormMessage /> {/* For messages related to permissions[scope] if any */}
            </div>
          ))}
        </div>
         <FormField
            control={control}
            name="permissions"
            render={() => <FormMessage />} // For overall permissions object errors
          />
      </div>
    </div>
  );
};

export default UserFormFields;
