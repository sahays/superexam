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

class IngestionStatus_State extends $pb.ProtobufEnum {
  static const IngestionStatus_State QUEUED =
      IngestionStatus_State._(0, _omitEnumNames ? '' : 'QUEUED');
  static const IngestionStatus_State PROCESSING_TEXT =
      IngestionStatus_State._(1, _omitEnumNames ? '' : 'PROCESSING_TEXT');
  static const IngestionStatus_State EXTRACTING_IMAGES =
      IngestionStatus_State._(2, _omitEnumNames ? '' : 'EXTRACTING_IMAGES');
  static const IngestionStatus_State SAVING =
      IngestionStatus_State._(3, _omitEnumNames ? '' : 'SAVING');
  static const IngestionStatus_State COMPLETED =
      IngestionStatus_State._(4, _omitEnumNames ? '' : 'COMPLETED');
  static const IngestionStatus_State FAILED =
      IngestionStatus_State._(5, _omitEnumNames ? '' : 'FAILED');

  static const $core.List<IngestionStatus_State> values =
      <IngestionStatus_State>[
    QUEUED,
    PROCESSING_TEXT,
    EXTRACTING_IMAGES,
    SAVING,
    COMPLETED,
    FAILED,
  ];

  static final $core.List<IngestionStatus_State?> _byValue =
      $pb.ProtobufEnum.$_initByValueList(values, 5);
  static IngestionStatus_State? valueOf($core.int value) =>
      value < 0 || value >= _byValue.length ? null : _byValue[value];

  const IngestionStatus_State._(super.value, super.name);
}

const $core.bool _omitEnumNames =
    $core.bool.fromEnvironment('protobuf.omit_enum_names');
