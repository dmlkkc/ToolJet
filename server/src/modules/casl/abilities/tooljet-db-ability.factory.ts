import { User } from 'src/entities/user.entity';
import { AbilityBuilder, Ability, AbilityClass, ExtractSubjectType } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/services/users.service';
import { isEmpty } from 'lodash';

export enum Action {
  ProxyPostgrest = 'proxyPostgrest',
  ViewTables = 'viewTables',
  ViewTable = 'viewTable',
  CreateTable = 'createTable',
  RenameTable = 'renameTable',
  DropTable = 'dropTable',
  AddColumn = 'addColumn',
  DropColumn = 'dropColumn',
  BulkUpload = 'bulkUpload',
  JoinTables = 'joinTables',
  EditColumn = 'editColumn',
  AddForeignKey = 'addForeignKey',
  UpdateForeignKey = 'updateForeignKey',
  DeleteForeignKey = 'deleteForeignKey',
}

type Subjects = 'all';

export type TooljetDbAbility = Ability<[Action, Subjects]>;

@Injectable()
export class TooljetDbAbilityFactory {
  constructor(private usersService: UsersService) {}

  async actions(user: User, params: any) {
    const { can, build } = new AbilityBuilder<Ability<[Action, Subjects]>>(Ability as AbilityClass<TooljetDbAbility>);
    const { organizationId, dataQuery } = params;
    const isPublicAppRequest = isEmpty(organizationId) && !isEmpty(dataQuery) && dataQuery.app.isPublic;
    const isUserLoggedin = !isEmpty(user) && !isEmpty(organizationId);
    const isAdmin = !isEmpty(user) ? await this.usersService.hasGroup(user, 'admin', params.organizationId) : false;

    if (isAdmin) {
      can(Action.CreateTable, 'all');
      can(Action.DropTable, 'all');
      can(Action.AddColumn, 'all');
      can(Action.DropColumn, 'all');
      can(Action.RenameTable, 'all');
      can(Action.BulkUpload, 'all');
      can(Action.EditColumn, 'all');
      can(Action.AddForeignKey, 'all');
      can(Action.UpdateForeignKey, 'all');
      can(Action.DeleteForeignKey, 'all');
    }

    if (isPublicAppRequest || isUserLoggedin) {
      can(Action.ProxyPostgrest, 'all');
    }

    can(Action.ViewTables, 'all');
    can(Action.ViewTable, 'all');
    can(Action.JoinTables, 'all');

    return build({
      detectSubjectType: (item) => item as ExtractSubjectType<Subjects>,
    });
  }
}
