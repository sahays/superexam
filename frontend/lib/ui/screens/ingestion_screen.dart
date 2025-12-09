import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:frontend/services/ingestion_service.dart';
import 'package:frontend/proto/ingestion.pb.dart' as proto;
import 'dart:typed_data';

class IngestionScreen extends StatefulWidget {
  const IngestionScreen({super.key});

  @override
  State<IngestionScreen> createState() => _IngestionScreenState();
}

class _IngestionScreenState extends State<IngestionScreen> {
  final _promptController = TextEditingController();
  final _ingestionService = IngestionService();
  
  String? _selectedFileName;
  Uint8List? _selectedFileData;
  
  List<proto.IngestionStatus> _logs = [];
  bool _isUploading = false;
  double _progress = 0.0;

  @override
  void dispose() {
    _promptController.dispose();
    _ingestionService.shutdown();
    super.dispose();
  }

  Future<void> _pickFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );

    if (result != null) {
      setState(() {
        _selectedFileName = result.files.single.name;
        _selectedFileData = result.files.single.bytes; // For web, bytes are loaded
      });
    }
  }

  Future<void> _startUpload() async {
    if (_selectedFileData == null) return;

    setState(() {
      _isUploading = true;
      _logs.clear();
      _progress = 0.0;
    });

    try {
      final stream = _ingestionService.uploadPdf(
        _selectedFileName!,
        _selectedFileData!,
        _promptController.text,
      );

      await for (var status in stream) {
        setState(() {
          _logs.add(status);
          _progress = status.progressPercent / 100.0;
        });
        
        if (status.state == proto.IngestionStatus_State.COMPLETED) {
           // Navigate or show success
           ScaffoldMessenger.of(context).showSnackBar(
             SnackBar(content: Text('Processing Complete! ID: ${status.documentId}')),
           );
        }
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      setState(() {
        _isUploading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // Using colors from design spec
    final bgColor = Color(0xFFF0F4F8);
    final cardColor = Colors.white.withOpacity(0.7); // Glassmorphism approx
    final primaryColor = Color(0xFF3B82F6);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: Text('New Exam', style: TextStyle(fontFamily: 'Plus Jakarta Sans', color: Colors.black)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: Colors.black),
      ),
      body: Center(
        child: Container(
          width: 600,
          padding: EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: cardColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withOpacity(0.5)),
            boxShadow: [
              BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4)),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Upload PDF', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, fontFamily: 'Plus Jakarta Sans')),
              SizedBox(height: 20),
              
              // File Picker
              InkWell(
                onTap: _pickFile,
                child: Container(
                  padding: EdgeInsets.all(30),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey.shade400, style: BorderStyle.solid),
                    borderRadius: BorderRadius.circular(8),
                    color: Colors.white54,
                  ),
                  child: Column(
                    children: [
                      Icon(Icons.cloud_upload_outlined, size: 48, color: primaryColor),
                      SizedBox(height: 10),
                      Text(_selectedFileName ?? 'Click to select PDF', style: TextStyle(fontFamily: 'Inter')),
                    ],
                  ),
                ),
              ),
              
              SizedBox(height: 20),
              
              // User Prompt
              TextField(
                controller: _promptController,
                maxLines: 3,
                decoration: InputDecoration(
                  labelText: 'Custom Instructions (Optional)',
                  hintText: 'e.g., "Extract only multiple choice questions"',
                  border: OutlineInputBorder(),
                  filled: true,
                  fillColor: Colors.white54,
                ),
              ),
              
              SizedBox(height: 20),
              
              if (_isUploading) ...[
                LinearProgressIndicator(value: _progress, color: primaryColor),
                SizedBox(height: 10),
                Text(_logs.isNotEmpty ? _logs.last.message : 'Starting...', style: TextStyle(fontFamily: 'Inter', color: Colors.grey)),
              ],
              
              SizedBox(height: 20),
              
              ElevatedButton(
                onPressed: _isUploading || _selectedFileData == null ? null : _startUpload,
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryColor,
                  padding: EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: Text('Process Document', style: TextStyle(fontSize: 16)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
