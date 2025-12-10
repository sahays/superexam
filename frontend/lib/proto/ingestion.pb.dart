// This is a generated file - do not edit.
//
// Generated from ingestion.proto.

// @dart = 3.3

// ignore_for_file: annotate_overrides, camel_case_types, comment_references
// ignore_for_file: constant_identifier_names
// ignore_for_file: curly_braces_in_flow_control_structures
// ignore_for_file: deprecated_member_use_from_same_package, library_prefixes
// ignore_for_file: non_constant_identifier_names, prefer_relative_imports

import 'dart:core' as $core;

import 'package:protobuf/protobuf.dart' as $pb;

import 'ingestion.pbenum.dart';

export 'package:protobuf/protobuf.dart' show GeneratedMessageGenericExtensions;

export 'ingestion.pbenum.dart';

class ListDocumentsRequest extends $pb.GeneratedMessage {
  factory ListDocumentsRequest({
    $core.int? pageSize,
    $core.String? pageToken,
  }) {
    final result = create();
    if (pageSize != null) result.pageSize = pageSize;
    if (pageToken != null) result.pageToken = pageToken;
    return result;
  }

  ListDocumentsRequest._();

  factory ListDocumentsRequest.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory ListDocumentsRequest.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'ListDocumentsRequest',
      package:
          const $pb.PackageName(_omitMessageNames ? '' : 'superexam.ingestion'),
      createEmptyInstance: create)
    ..aI(1, _omitFieldNames ? '' : 'pageSize')
    ..aOS(2, _omitFieldNames ? '' : 'pageToken')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ListDocumentsRequest clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ListDocumentsRequest copyWith(void Function(ListDocumentsRequest) updates) =>
      super.copyWith((message) => updates(message as ListDocumentsRequest))
          as ListDocumentsRequest;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static ListDocumentsRequest create() => ListDocumentsRequest._();
  @$core.override
  ListDocumentsRequest createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static ListDocumentsRequest getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<ListDocumentsRequest>(create);
  static ListDocumentsRequest? _defaultInstance;

  @$pb.TagNumber(1)
  $core.int get pageSize => $_getIZ(0);
  @$pb.TagNumber(1)
  set pageSize($core.int value) => $_setSignedInt32(0, value);
  @$pb.TagNumber(1)
  $core.bool hasPageSize() => $_has(0);
  @$pb.TagNumber(1)
  void clearPageSize() => $_clearField(1);

  @$pb.TagNumber(2)
  $core.String get pageToken => $_getSZ(1);
  @$pb.TagNumber(2)
  set pageToken($core.String value) => $_setString(1, value);
  @$pb.TagNumber(2)
  $core.bool hasPageToken() => $_has(1);
  @$pb.TagNumber(2)
  void clearPageToken() => $_clearField(2);
}

class ListDocumentsResponse extends $pb.GeneratedMessage {
  factory ListDocumentsResponse({
    $core.Iterable<Document>? documents,
    $core.String? nextPageToken,
  }) {
    final result = create();
    if (documents != null) result.documents.addAll(documents);
    if (nextPageToken != null) result.nextPageToken = nextPageToken;
    return result;
  }

  ListDocumentsResponse._();

  factory ListDocumentsResponse.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory ListDocumentsResponse.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'ListDocumentsResponse',
      package:
          const $pb.PackageName(_omitMessageNames ? '' : 'superexam.ingestion'),
      createEmptyInstance: create)
    ..pPM<Document>(1, _omitFieldNames ? '' : 'documents',
        subBuilder: Document.create)
    ..aOS(2, _omitFieldNames ? '' : 'nextPageToken')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ListDocumentsResponse clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ListDocumentsResponse copyWith(
          void Function(ListDocumentsResponse) updates) =>
      super.copyWith((message) => updates(message as ListDocumentsResponse))
          as ListDocumentsResponse;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static ListDocumentsResponse create() => ListDocumentsResponse._();
  @$core.override
  ListDocumentsResponse createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static ListDocumentsResponse getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<ListDocumentsResponse>(create);
  static ListDocumentsResponse? _defaultInstance;

  @$pb.TagNumber(1)
  $pb.PbList<Document> get documents => $_getList(0);

  @$pb.TagNumber(2)
  $core.String get nextPageToken => $_getSZ(1);
  @$pb.TagNumber(2)
  set nextPageToken($core.String value) => $_setString(1, value);
  @$pb.TagNumber(2)
  $core.bool hasNextPageToken() => $_has(1);
  @$pb.TagNumber(2)
  void clearNextPageToken() => $_clearField(2);
}

class ProcessRequest extends $pb.GeneratedMessage {
  factory ProcessRequest({
    $core.String? documentId,
    $core.String? schemaId,
    $core.String? promptOverride,
  }) {
    final result = create();
    if (documentId != null) result.documentId = documentId;
    if (schemaId != null) result.schemaId = schemaId;
    if (promptOverride != null) result.promptOverride = promptOverride;
    return result;
  }

  ProcessRequest._();

  factory ProcessRequest.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory ProcessRequest.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'ProcessRequest',
      package:
          const $pb.PackageName(_omitMessageNames ? '' : 'superexam.ingestion'),
      createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'documentId')
    ..aOS(2, _omitFieldNames ? '' : 'schemaId')
    ..aOS(3, _omitFieldNames ? '' : 'promptOverride')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ProcessRequest clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  ProcessRequest copyWith(void Function(ProcessRequest) updates) =>
      super.copyWith((message) => updates(message as ProcessRequest))
          as ProcessRequest;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static ProcessRequest create() => ProcessRequest._();
  @$core.override
  ProcessRequest createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static ProcessRequest getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<ProcessRequest>(create);
  static ProcessRequest? _defaultInstance;

  @$pb.TagNumber(1)
  $core.String get documentId => $_getSZ(0);
  @$pb.TagNumber(1)
  set documentId($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasDocumentId() => $_has(0);
  @$pb.TagNumber(1)
  void clearDocumentId() => $_clearField(1);

  @$pb.TagNumber(2)
  $core.String get schemaId => $_getSZ(1);
  @$pb.TagNumber(2)
  set schemaId($core.String value) => $_setString(1, value);
  @$pb.TagNumber(2)
  $core.bool hasSchemaId() => $_has(1);
  @$pb.TagNumber(2)
  void clearSchemaId() => $_clearField(2);

  @$pb.TagNumber(3)
  $core.String get promptOverride => $_getSZ(2);
  @$pb.TagNumber(3)
  set promptOverride($core.String value) => $_setString(2, value);
  @$pb.TagNumber(3)
  $core.bool hasPromptOverride() => $_has(2);
  @$pb.TagNumber(3)
  void clearPromptOverride() => $_clearField(3);
}

class Document extends $pb.GeneratedMessage {
  factory Document({
    $core.String? id,
    $core.String? filename,
    $core.String? status,
    $core.String? createdAt,
  }) {
    final result = create();
    if (id != null) result.id = id;
    if (filename != null) result.filename = filename;
    if (status != null) result.status = status;
    if (createdAt != null) result.createdAt = createdAt;
    return result;
  }

  Document._();

  factory Document.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory Document.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'Document',
      package:
          const $pb.PackageName(_omitMessageNames ? '' : 'superexam.ingestion'),
      createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'id')
    ..aOS(2, _omitFieldNames ? '' : 'filename')
    ..aOS(3, _omitFieldNames ? '' : 'status')
    ..aOS(4, _omitFieldNames ? '' : 'createdAt')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  Document clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  Document copyWith(void Function(Document) updates) =>
      super.copyWith((message) => updates(message as Document)) as Document;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static Document create() => Document._();
  @$core.override
  Document createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static Document getDefault() =>
      _defaultInstance ??= $pb.GeneratedMessage.$_defaultFor<Document>(create);
  static Document? _defaultInstance;

  @$pb.TagNumber(1)
  $core.String get id => $_getSZ(0);
  @$pb.TagNumber(1)
  set id($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasId() => $_has(0);
  @$pb.TagNumber(1)
  void clearId() => $_clearField(1);

  @$pb.TagNumber(2)
  $core.String get filename => $_getSZ(1);
  @$pb.TagNumber(2)
  set filename($core.String value) => $_setString(1, value);
  @$pb.TagNumber(2)
  $core.bool hasFilename() => $_has(1);
  @$pb.TagNumber(2)
  void clearFilename() => $_clearField(2);

  @$pb.TagNumber(3)
  $core.String get status => $_getSZ(2);
  @$pb.TagNumber(3)
  set status($core.String value) => $_setString(2, value);
  @$pb.TagNumber(3)
  $core.bool hasStatus() => $_has(2);
  @$pb.TagNumber(3)
  void clearStatus() => $_clearField(3);

  @$pb.TagNumber(4)
  $core.String get createdAt => $_getSZ(3);
  @$pb.TagNumber(4)
  set createdAt($core.String value) => $_setString(3, value);
  @$pb.TagNumber(4)
  $core.bool hasCreatedAt() => $_has(3);
  @$pb.TagNumber(4)
  void clearCreatedAt() => $_clearField(4);
}

class UploadRequest extends $pb.GeneratedMessage {
  factory UploadRequest({
    FileMetadata? metadata,
    $core.List<$core.int>? fileData,
  }) {
    final result = create();
    if (metadata != null) result.metadata = metadata;
    if (fileData != null) result.fileData = fileData;
    return result;
  }

  UploadRequest._();

  factory UploadRequest.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory UploadRequest.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'UploadRequest',
      package:
          const $pb.PackageName(_omitMessageNames ? '' : 'superexam.ingestion'),
      createEmptyInstance: create)
    ..aOM<FileMetadata>(1, _omitFieldNames ? '' : 'metadata',
        subBuilder: FileMetadata.create)
    ..a<$core.List<$core.int>>(
        2, _omitFieldNames ? '' : 'fileData', $pb.PbFieldType.OY)
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  UploadRequest clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  UploadRequest copyWith(void Function(UploadRequest) updates) =>
      super.copyWith((message) => updates(message as UploadRequest))
          as UploadRequest;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static UploadRequest create() => UploadRequest._();
  @$core.override
  UploadRequest createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static UploadRequest getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<UploadRequest>(create);
  static UploadRequest? _defaultInstance;

  @$pb.TagNumber(1)
  FileMetadata get metadata => $_getN(0);
  @$pb.TagNumber(1)
  set metadata(FileMetadata value) => $_setField(1, value);
  @$pb.TagNumber(1)
  $core.bool hasMetadata() => $_has(0);
  @$pb.TagNumber(1)
  void clearMetadata() => $_clearField(1);
  @$pb.TagNumber(1)
  FileMetadata ensureMetadata() => $_ensure(0);

  @$pb.TagNumber(2)
  $core.List<$core.int> get fileData => $_getN(1);
  @$pb.TagNumber(2)
  set fileData($core.List<$core.int> value) => $_setBytes(1, value);
  @$pb.TagNumber(2)
  $core.bool hasFileData() => $_has(1);
  @$pb.TagNumber(2)
  void clearFileData() => $_clearField(2);
}

class FileMetadata extends $pb.GeneratedMessage {
  factory FileMetadata({
    $core.String? filename,
    $core.String? contentType,
    $core.String? userPrompt,
  }) {
    final result = create();
    if (filename != null) result.filename = filename;
    if (contentType != null) result.contentType = contentType;
    if (userPrompt != null) result.userPrompt = userPrompt;
    return result;
  }

  FileMetadata._();

  factory FileMetadata.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory FileMetadata.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'FileMetadata',
      package:
          const $pb.PackageName(_omitMessageNames ? '' : 'superexam.ingestion'),
      createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'filename')
    ..aOS(2, _omitFieldNames ? '' : 'contentType')
    ..aOS(3, _omitFieldNames ? '' : 'userPrompt')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  FileMetadata clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  FileMetadata copyWith(void Function(FileMetadata) updates) =>
      super.copyWith((message) => updates(message as FileMetadata))
          as FileMetadata;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static FileMetadata create() => FileMetadata._();
  @$core.override
  FileMetadata createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static FileMetadata getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<FileMetadata>(create);
  static FileMetadata? _defaultInstance;

  @$pb.TagNumber(1)
  $core.String get filename => $_getSZ(0);
  @$pb.TagNumber(1)
  set filename($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasFilename() => $_has(0);
  @$pb.TagNumber(1)
  void clearFilename() => $_clearField(1);

  @$pb.TagNumber(2)
  $core.String get contentType => $_getSZ(1);
  @$pb.TagNumber(2)
  set contentType($core.String value) => $_setString(1, value);
  @$pb.TagNumber(2)
  $core.bool hasContentType() => $_has(1);
  @$pb.TagNumber(2)
  void clearContentType() => $_clearField(2);

  @$pb.TagNumber(3)
  $core.String get userPrompt => $_getSZ(2);
  @$pb.TagNumber(3)
  set userPrompt($core.String value) => $_setString(2, value);
  @$pb.TagNumber(3)
  $core.bool hasUserPrompt() => $_has(2);
  @$pb.TagNumber(3)
  void clearUserPrompt() => $_clearField(3);
}

class IngestionStatus extends $pb.GeneratedMessage {
  factory IngestionStatus({
    IngestionStatus_State? state,
    $core.String? message,
    $core.String? documentId,
    $core.int? progressPercent,
  }) {
    final result = create();
    if (state != null) result.state = state;
    if (message != null) result.message = message;
    if (documentId != null) result.documentId = documentId;
    if (progressPercent != null) result.progressPercent = progressPercent;
    return result;
  }

  IngestionStatus._();

  factory IngestionStatus.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory IngestionStatus.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'IngestionStatus',
      package:
          const $pb.PackageName(_omitMessageNames ? '' : 'superexam.ingestion'),
      createEmptyInstance: create)
    ..aE<IngestionStatus_State>(1, _omitFieldNames ? '' : 'state',
        enumValues: IngestionStatus_State.values)
    ..aOS(2, _omitFieldNames ? '' : 'message')
    ..aOS(3, _omitFieldNames ? '' : 'documentId')
    ..aI(4, _omitFieldNames ? '' : 'progressPercent')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  IngestionStatus clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  IngestionStatus copyWith(void Function(IngestionStatus) updates) =>
      super.copyWith((message) => updates(message as IngestionStatus))
          as IngestionStatus;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static IngestionStatus create() => IngestionStatus._();
  @$core.override
  IngestionStatus createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static IngestionStatus getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<IngestionStatus>(create);
  static IngestionStatus? _defaultInstance;

  @$pb.TagNumber(1)
  IngestionStatus_State get state => $_getN(0);
  @$pb.TagNumber(1)
  set state(IngestionStatus_State value) => $_setField(1, value);
  @$pb.TagNumber(1)
  $core.bool hasState() => $_has(0);
  @$pb.TagNumber(1)
  void clearState() => $_clearField(1);

  @$pb.TagNumber(2)
  $core.String get message => $_getSZ(1);
  @$pb.TagNumber(2)
  set message($core.String value) => $_setString(1, value);
  @$pb.TagNumber(2)
  $core.bool hasMessage() => $_has(1);
  @$pb.TagNumber(2)
  void clearMessage() => $_clearField(2);

  @$pb.TagNumber(3)
  $core.String get documentId => $_getSZ(2);
  @$pb.TagNumber(3)
  set documentId($core.String value) => $_setString(2, value);
  @$pb.TagNumber(3)
  $core.bool hasDocumentId() => $_has(2);
  @$pb.TagNumber(3)
  void clearDocumentId() => $_clearField(3);

  @$pb.TagNumber(4)
  $core.int get progressPercent => $_getIZ(3);
  @$pb.TagNumber(4)
  set progressPercent($core.int value) => $_setSignedInt32(3, value);
  @$pb.TagNumber(4)
  $core.bool hasProgressPercent() => $_has(3);
  @$pb.TagNumber(4)
  void clearProgressPercent() => $_clearField(4);
}

const $core.bool _omitFieldNames =
    $core.bool.fromEnvironment('protobuf.omit_field_names');
const $core.bool _omitMessageNames =
    $core.bool.fromEnvironment('protobuf.omit_message_names');
