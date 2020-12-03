//
// Not used
// This file was a scoping out of how to type LanguageClient notifications/requests
//

import type {
  SchemaAdditions,
  SchemaDeletions,
} from "yaml-language-server/out/server/src/languageservice/services/yamlSchemaService";
import type { SchemaConfiguration } from "yaml-language-server/out/server/src/languageservice/yamlLanguageService";
export type { SchemaConfiguration } from "yaml-language-server/out/server/src/languageservice/yamlLanguageService";

export type SchemaAssociations = Record<string, string[]>;

interface Message<T extends string = string, U extends any[] = any[]> {
  method: T;
  parameters: U;
}

export type SchemaAssociationNotification = Message<
  "json/schemaAssociations",
  [SchemaConfiguration[] | SchemaAssociations]
>;

export type SchemaModificationNotification = Message<
  "json/schema/modify",
  [SchemaAdditions | SchemaDeletions, void, {}, {}]
>;

export type DynamicCustomSchemaRequestRegistration = Message<
  "yaml/registerCustomSchemaRequest",
  []
>;
export type VSCodeContentRequestRegistration = Message<
  "yaml/registerContentRequest",
  []
>;
export type VSCodeContentRequest = Message<"vscode/content", []>;
export type CustomSchemaContentRequest = Message<"custom/schema/content", []>;
export type CustomSchemaRequest = Message<"custom/schema/request", []>;
export type ColorSymbolRequest = Message<"json/colorSymbols", []>;

export class TypedLanguageClient {
  constructor(private client: LanguageClient) {}

  sendNotification<T extends Message = Message>(
    method: T["method"],
    ...parameters: T["parameters"]
  ) {
    this.client.sendNotification(method, ...parameters);
  }

  onNotification<T extends Message = Message>(
    method: T["method"],
    callback: (...parameters: T["parameters"]) => void
  ) {
    this.client.onNotification(method, callback);
  }

  sendRequest<T extends Message = Message>(
    method: T["method"],
    ...parameters: T["parameters"]
  ) {
    this.client.sendRequest(method, ...parameters);
  }

  onRequest<T extends Message = Message>(
    method: T["method"],
    callback: (...parameters: T["parameters"]) => void
  ) {
    this.client.onRequest(method, callback);
  }
}
