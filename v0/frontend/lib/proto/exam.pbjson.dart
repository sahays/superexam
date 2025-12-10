// This is a generated file - do not edit.
//
// Generated from exam.proto.

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

@$core.Deprecated('Use emptyDescriptor instead')
const Empty$json = {
  '1': 'Empty',
};

/// Descriptor for `Empty`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List emptyDescriptor =
    $convert.base64Decode('CgVFbXB0eQ==');

@$core.Deprecated('Use countResponseDescriptor instead')
const CountResponse$json = {
  '1': 'CountResponse',
  '2': [
    {'1': 'count', '3': 1, '4': 1, '5': 5, '10': 'count'},
  ],
};

/// Descriptor for `CountResponse`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List countResponseDescriptor = $convert
    .base64Decode('Cg1Db3VudFJlc3BvbnNlEhQKBWNvdW50GAEgASgFUgVjb3VudA==');

@$core.Deprecated('Use createExamRequestDescriptor instead')
const CreateExamRequest$json = {
  '1': 'CreateExamRequest',
  '2': [
    {'1': 'question_count', '3': 1, '4': 1, '5': 5, '10': 'questionCount'},
  ],
};

/// Descriptor for `CreateExamRequest`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List createExamRequestDescriptor = $convert.base64Decode(
    'ChFDcmVhdGVFeGFtUmVxdWVzdBIlCg5xdWVzdGlvbl9jb3VudBgBIAEoBVINcXVlc3Rpb25Db3'
    'VudA==');

@$core.Deprecated('Use examSessionDescriptor instead')
const ExamSession$json = {
  '1': 'ExamSession',
  '2': [
    {'1': 'exam_id', '3': 1, '4': 1, '5': 9, '10': 'examId'},
    {
      '1': 'questions',
      '3': 2,
      '4': 3,
      '5': 11,
      '6': '.superexam.exam.Question',
      '10': 'questions'
    },
    {'1': 'duration_seconds', '3': 3, '4': 1, '5': 5, '10': 'durationSeconds'},
  ],
};

/// Descriptor for `ExamSession`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List examSessionDescriptor = $convert.base64Decode(
    'CgtFeGFtU2Vzc2lvbhIXCgdleGFtX2lkGAEgASgJUgZleGFtSWQSNgoJcXVlc3Rpb25zGAIgAy'
    'gLMhguc3VwZXJleGFtLmV4YW0uUXVlc3Rpb25SCXF1ZXN0aW9ucxIpChBkdXJhdGlvbl9zZWNv'
    'bmRzGAMgASgFUg9kdXJhdGlvblNlY29uZHM=');

@$core.Deprecated('Use questionDescriptor instead')
const Question$json = {
  '1': 'Question',
  '2': [
    {'1': 'id', '3': 1, '4': 1, '5': 9, '10': 'id'},
    {'1': 'text', '3': 2, '4': 1, '5': 9, '10': 'text'},
    {
      '1': 'choices',
      '3': 3,
      '4': 3,
      '5': 11,
      '6': '.superexam.exam.Choice',
      '10': 'choices'
    },
    {'1': 'image_urls', '3': 4, '4': 3, '5': 9, '10': 'imageUrls'},
  ],
};

/// Descriptor for `Question`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List questionDescriptor = $convert.base64Decode(
    'CghRdWVzdGlvbhIOCgJpZBgBIAEoCVICaWQSEgoEdGV4dBgCIAEoCVIEdGV4dBIwCgdjaG9pY2'
    'VzGAMgAygLMhYuc3VwZXJleGFtLmV4YW0uQ2hvaWNlUgdjaG9pY2VzEh0KCmltYWdlX3VybHMY'
    'BCADKAlSCWltYWdlVXJscw==');

@$core.Deprecated('Use choiceDescriptor instead')
const Choice$json = {
  '1': 'Choice',
  '2': [
    {'1': 'id', '3': 1, '4': 1, '5': 9, '10': 'id'},
    {'1': 'text', '3': 2, '4': 1, '5': 9, '10': 'text'},
  ],
};

/// Descriptor for `Choice`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List choiceDescriptor = $convert.base64Decode(
    'CgZDaG9pY2USDgoCaWQYASABKAlSAmlkEhIKBHRleHQYAiABKAlSBHRleHQ=');

@$core.Deprecated('Use examSubmissionDescriptor instead')
const ExamSubmission$json = {
  '1': 'ExamSubmission',
  '2': [
    {'1': 'exam_id', '3': 1, '4': 1, '5': 9, '10': 'examId'},
    {
      '1': 'answers',
      '3': 2,
      '4': 3,
      '5': 11,
      '6': '.superexam.exam.Answer',
      '10': 'answers'
    },
  ],
};

/// Descriptor for `ExamSubmission`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List examSubmissionDescriptor = $convert.base64Decode(
    'Cg5FeGFtU3VibWlzc2lvbhIXCgdleGFtX2lkGAEgASgJUgZleGFtSWQSMAoHYW5zd2VycxgCIA'
    'MoCzIWLnN1cGVyZXhhbS5leGFtLkFuc3dlclIHYW5zd2Vycw==');

@$core.Deprecated('Use answerDescriptor instead')
const Answer$json = {
  '1': 'Answer',
  '2': [
    {'1': 'question_id', '3': 1, '4': 1, '5': 9, '10': 'questionId'},
    {
      '1': 'selected_choice_ids',
      '3': 2,
      '4': 3,
      '5': 9,
      '10': 'selectedChoiceIds'
    },
  ],
};

/// Descriptor for `Answer`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List answerDescriptor = $convert.base64Decode(
    'CgZBbnN3ZXISHwoLcXVlc3Rpb25faWQYASABKAlSCnF1ZXN0aW9uSWQSLgoTc2VsZWN0ZWRfY2'
    'hvaWNlX2lkcxgCIAMoCVIRc2VsZWN0ZWRDaG9pY2VJZHM=');

@$core.Deprecated('Use examResultDescriptor instead')
const ExamResult$json = {
  '1': 'ExamResult',
  '2': [
    {'1': 'exam_id', '3': 1, '4': 1, '5': 9, '10': 'examId'},
    {'1': 'score', '3': 2, '4': 1, '5': 5, '10': 'score'},
    {'1': 'total_score', '3': 3, '4': 1, '5': 5, '10': 'totalScore'},
    {'1': 'passed', '3': 4, '4': 1, '5': 8, '10': 'passed'},
  ],
};

/// Descriptor for `ExamResult`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List examResultDescriptor = $convert.base64Decode(
    'CgpFeGFtUmVzdWx0EhcKB2V4YW1faWQYASABKAlSBmV4YW1JZBIUCgVzY29yZRgCIAEoBVIFc2'
    'NvcmUSHwoLdG90YWxfc2NvcmUYAyABKAVSCnRvdGFsU2NvcmUSFgoGcGFzc2VkGAQgASgIUgZw'
    'YXNzZWQ=');
