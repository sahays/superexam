import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:frontend/services/ingestion_service.dart';
import 'package:frontend/proto/ingestion.pb.dart';

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  final _ingestionService = IngestionService();
  List<Document> _documents = [];
  bool _isLoading = true;
  bool _isUploading = false;

  @override
  void initState() {
    super.initState();
    _loadDocuments();
  }

  Future<void> _loadDocuments() async {
    try {
      final docs = await _ingestionService.listDocuments();
      // Sort by creation time desc (assuming DB returns in default order, but safer to sort if needed)
      // For now just use as is.
      if (mounted) {
        setState(() {
          _documents = docs;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load documents: $e')),
        );
      }
    }
  }

  Future<void> _pickAndUpload() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
      withData: true,
    );

    if (result != null) {
      final file = result.files.single;
      if (file.bytes == null) return;

      setState(() => _isUploading = true);

      try {
        // Upload logic
        // We iterate the stream but for upload it just returns status.
        // We only care when it completes.
        await for (var status in _ingestionService.uploadPdf(file.name, file.bytes!, "")) {
           if (status.state == IngestionStatus_State.FAILED) {
             throw Exception(status.message);
           }
           if (status.state == IngestionStatus_State.QUEUED || status.state == IngestionStatus_State.COMPLETED) {
             // Upload done (backend returns Queued/Completed for upload phase now)
           }
        }
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Upload successful!')),
          );
          _loadDocuments();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Upload failed: $e')),
          );
        }
      } finally {
        if (mounted) {
          setState(() => _isUploading = false);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final brightness = MediaQuery.of(context).platformBrightness;
    final isDark = brightness == Brightness.dark;
    
    final textPrimary = isDark ? const Color(0xFFFFFFFF) : const Color(0xFF1F2937);
    final textSecondary = isDark ? const Color(0xFF9CA3AF) : const Color(0xFF64748B);
    final accentColor = const Color(0xFF3B82F6);

    return Container(
      constraints: const BoxConstraints(maxWidth: 1000),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Documents',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: textPrimary,
                  letterSpacing: -0.5,
                ),
              ),
              ElevatedButton.icon(
                onPressed: _isUploading ? null : _pickAndUpload,
                icon: _isUploading 
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.upload_file),
                label: Text(_isUploading ? 'Uploading...' : 'Upload New'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: accentColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),
          
          // List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _documents.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.description_outlined, size: 64, color: textSecondary.withOpacity(0.5)),
                            const SizedBox(height: 16),
                            Text("No documents yet", style: TextStyle(color: textSecondary, fontSize: 16)),
                          ],
                        ),
                      )
                    : ListView.separated(
                        itemCount: _documents.length,
                        separatorBuilder: (ctx, i) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          return _DocumentCard(
                            document: _documents[index],
                            ingestionService: _ingestionService,
                            onRefresh: _loadDocuments,
                            isDark: isDark,
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

class _DocumentCard extends StatefulWidget {
  final Document document;
  final IngestionService ingestionService;
  final VoidCallback onRefresh;
  final bool isDark;

  const _DocumentCard({
    required this.document,
    required this.ingestionService,
    required this.onRefresh,
    required this.isDark,
  });

  @override
  State<_DocumentCard> createState() => _DocumentCardState();
}

class _DocumentCardState extends State<_DocumentCard> {
  bool _isProcessing = false;
  double? _processProgress;

  Future<void> _processDocument() async {
    setState(() {
      _isProcessing = true;
      _processProgress = 0.0;
    });

    try {
      final stream = widget.ingestionService.processDocument(widget.document.id);
      await for (var status in stream) {
        if (mounted) {
          setState(() {
            _processProgress = status.progressPercent / 100.0;
          });
        }
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Processing complete!'), backgroundColor: Colors.green),
        );
        widget.onRefresh(); // Refresh list to show updated status
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Processing failed: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isProcessing = false;
          _processProgress = null;
        });
      }
    }
  }

  Future<void> _deleteDocument() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Document'),
        content: Text('Are you sure you want to delete "${widget.document.filename}"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true), 
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete')
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await widget.ingestionService.deleteDocument(widget.document.id);
        widget.onRefresh();
      } catch (e) {
        if (mounted) {
           ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Delete failed: $e')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final cardColor = widget.isDark ? const Color(0xFF151725) : const Color(0xFFFFFFFF);
    final textPrimary = widget.isDark ? const Color(0xFFFFFFFF) : const Color(0xFF1F2937);
    final textSecondary = widget.isDark ? const Color(0xFF9CA3AF) : const Color(0xFF64748B);
    final borderColor = widget.isDark ? Colors.white10 : Colors.grey.shade200;

    final canProcess = !_isProcessing && (widget.document.status == 'Uploaded' || widget.document.status == 'Failed');
    
    // Status Color
    Color statusColor;
    switch (widget.document.status) {
      case 'Succeeded': statusColor = Colors.green; break;
      case 'Processing': statusColor = Colors.blue; break;
      case 'Failed': statusColor = Colors.red; break;
      default: statusColor = Colors.grey;
    }

    return Container(
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 48, height: 48,
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.description, color: statusColor),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.document.filename,
                      style: GoogleFonts.inter(
                        fontSize: 16, 
                        fontWeight: FontWeight.w600,
                        color: textPrimary
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Container(
                          width: 8, height: 8,
                          decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          widget.document.status,
                          style: GoogleFonts.inter(fontSize: 13, color: textSecondary),
                        ),
                        const SizedBox(width: 12),
                        Text(
                          widget.document.createdAt.split('T')[0], // Simple date
                          style: GoogleFonts.inter(fontSize: 13, color: textSecondary.withOpacity(0.7)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              
              // Actions
              if (_isProcessing)
                SizedBox(
                  width: 100,
                  child: Column(
                    children: [
                      LinearProgressIndicator(value: _processProgress),
                      const SizedBox(height: 4),
                      Text(
                        "${((_processProgress ?? 0) * 100).toInt()}%",
                        style: TextStyle(fontSize: 10, color: textSecondary),
                      )
                    ],
                  ),
                )
              else
                Row(
                  children: [
                    if (canProcess)
                      IconButton(
                        tooltip: 'Process Document',
                        icon: const Icon(Icons.bolt),
                        color: Colors.orange,
                        onPressed: _processDocument,
                      ),
                    IconButton(
                      tooltip: 'Delete',
                      icon: const Icon(Icons.delete_outline),
                      color: textSecondary, // Subtle delete
                      hoverColor: Colors.red.withOpacity(0.1),
                      onPressed: _deleteDocument,
                    ),
                  ],
                )
            ],
          ),
        ],
      ),
    );
  }
}
