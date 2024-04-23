import {
  Entity,
  AfterLoad,
  AfterInsert,
  getRepository,
  getManager,
  OneToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { AppVersion } from './app_version.entity';
import { AppGroupPermission } from './app_group_permission.entity';
import { AppGitSync } from './app_git_sync.entity';
import { GroupPermission } from './group_permission.entity';
import { User } from './user.entity';

@Entity({ name: 'apps' })
export class App extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'type' })
  type: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'slug', unique: true })
  slug: string;

  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  @Column({ name: 'is_maintenance_on', default: false })
  isMaintenanceOn: boolean;

  @Column({ name: 'icon' })
  icon: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'current_version_id' })
  currentVersionId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'workflow_api_token' })
  workflowApiToken: string;

  @Column({ name: 'workflow_enabled', default: false })
  workflowEnabled: boolean;

  @CreateDateColumn({ default: () => 'now()', name: 'created_at' })
  createdAt: Date;

  @Column({
    type: 'enum',
    enumName: 'app_creation_mode',
    name: 'creation_mode',
    enum: ['GIT', 'DEFAULT'],
    default: 'DEFAULT',
  })
  creationMode: string;

  @UpdateDateColumn({ default: () => 'now()', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => AppVersion, (appVersion) => appVersion.app, {
    onDelete: 'CASCADE',
  })
  appVersions: AppVersion[];

  @ManyToMany(() => GroupPermission)
  @JoinTable({
    name: 'app_group_permissions',
    joinColumn: {
      name: 'app_id',
    },
    inverseJoinColumn: {
      name: 'group_permission_id',
    },
  })
  groupPermissions: GroupPermission[];

  @OneToOne(() => AppGitSync, (appGitSync) => appGitSync.app, { onDelete: 'CASCADE' })
  appGitSync: AppGitSync;

  @OneToMany(() => AppGroupPermission, (appGroupPermission) => appGroupPermission.app, { onDelete: 'CASCADE' })
  @OneToMany(() => AppGroupPermission, (appGroupPermission) => appGroupPermission.app, {
    onDelete: 'CASCADE',
  })
  appGroupPermissions: AppGroupPermission[];

  public editingVersion;

  @AfterInsert()
  async updateSlug(): Promise<void> {
    if (!this.slug) {
      const appRepository = getRepository(App);
      await appRepository.update(this.id, { slug: this.id });
    }
  }

  @AfterLoad()
  async afterLoad(): Promise<void> {
    this.editingVersion = await getManager().findOne(AppVersion, {
      where: { appId: this.id },
      order: { updatedAt: 'DESC' },
    });
  }
}
