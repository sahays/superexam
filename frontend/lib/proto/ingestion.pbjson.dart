// This is a generated file - do not edit.
//
// Generated from ingestion.proto.

// @dart = 3.3

// ignore_for_file: annotate_overrides, camel_case_types, comment_references
// ignore_for_file: constant_identifier_names
// ignore_for_file: curly_braces_in_flow_control_structures
// ignore_for_file: deprecated_member_use_from_same_package, library_prefixes
// ignore_for_file: non_constant_identifier_names, prefer_relative_imports
// ignore_for_file: unused_import

import 'dart:convert' as $convert;
import 'dart:core' as $core;
import 'dart:typed_data' as $typed_data;

@$core.Deprecated('Use uploadRequestDescriptor instead')
const UploadRequest$json = {
  '1': 'UploadRequest',
  '2': [
    {
      '1': 'metadata',
      '3': 1,
      '4': 1,
      '5': 11,
      '6': '.superexam.ingestion.FileMetadata',
      '10': 'metadata'
    },
    {'1': 'file_data', '3': 2, '4': 1, '5': 12, '10': 'fileData'},
  ],
};

/// Descriptor for `UploadRequest`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List uploadRequestDescriptor = $convert.base64Decode(
    'Cg1VcGxvYWRSZXF1ZXN0Ej0KCG1ldGFkYXRhGAEgASgLMiEuc3VwZXJleGFtLmluZ2VzdGlvbi'
    '5GaWxlTWV0YWRhdGFSCG1ldGFkYXRhEhsKCWZpbGVfZGF0YRgCIAEoDFIIZmlsZURhdGE=');

@$core.Deprecated('Use fileMetadataDescriptor instead')
const FileMetadata$json = {
  '1': 'FileMetadata',
  '2': [
    {'1': 'filename', '3': 1, '4': 1, '5': 9, '10': 'filename'},
    {'1': 'content_type', '3': 2, '4': 1, '5': 9, '10': 'contentType'},
    {'1': 'user_prompt', '3': 3, '4': 1, '5': 9, '10': 'userPrompt'},
  ],
};

/// Descriptor for `FileMetadata`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List fileMetadataDescriptor = $convert.base64Decode(
    'CgxGaWxlTWV0YWRhdGESGgoIZmlsZW5hbWUYASABKAlSCGZpbGVuYW1lEiEKDGNvbnRlbnRfdH'
    'lwZRgCIAEoCVILY29udGVudFR5cGUSHwoLdXNlcl9wcm9tcHQYAyABKAlSCnVzZXJQcm9tcHQ=');

@$core.Deprecated('Use ingestionStatusDescriptor instead')
const IngestionStatus$json = {
  '1': 'IngestionStatus',
  '2': [
    {
      '1': 'state',
      '3': 1,
      '4': 1,
      '5': 14,
      '6': '.superexam.ingestion.IngestionStatus.State',
      '10': 'state'
    },
    {'1': 'message', '3': 2, '4': 1, '5': 9, '10': 'message'},
    {'1': 'document_id', '3': 3, '4': 1, '5': 9, '10': 'documentId'},
    {'1': 'progress_percent', '3': 4, '4': 1, '5': 5, '10': 'progressPercent'},
  ],
  '4': [IngestionStatus_State$json],
};

@$core.Deprecated('Use ingestionStatusDescriptor instead')
const IngestionStatus_State$json = {
  '1': 'State',
  '2': [
    {'1': 'QUEUED', '2': 0},
    {'1': 'PROCESSING_TEXT', '2': 1},
    {'1': 'EXTRACTING_IMAGES', '2': 2},
    {'1': 'SAVING', '2': 3},
    {'1': 'COMPLETED', '2': 4},
    {'1': 'FAILED', '2': 5},
  ],
};

/// Descriptor for `IngestionStatus`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List ingestionStatusDescriptor = $convert.base64Decode(
    'Cg9Jbmdlc3Rpb25TdGF0dXMSQAoFc3RhdGUYASABKA4yKi5zdXBlcmV4YW0uaW5nZXN0aW9uLk'
    'luZ2VzdGlvblN0YXR1cy5TdGF0ZVIFc3RhdGUSGAoHbWVzc2FnZRgCIAEoCVIHbWVzc2FnZRIf'
    'Cgtkb2N1bWVudF9pZBgDIAEoCVIKZG9jdW1lbnRJZBIpChBwcm9ncmVzc19wZXJjZW50GAQgAS'
    'gFUg9wcm9ncmVzc1BlcmNlbnQiZgoFU3RhdGUSCgoGUVVFVUVEEAASEwoPUFJPQ0VTU0lOR19U'
    'RVhUEAESFQoRRVhUUkFDVElOR19JTUFHRVMQAhIKCgZTQVZJTkcQAxINCglDT01QTEVURUQQBB'
    'IKCgZGQUlMRUQQBQ==');
