import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Linking,
  FlatList
} from 'react-native';

// Be sure to install this via `npm install react-native-dropdown-picker`
import DropDownPicker from 'react-native-dropdown-picker';

// Be sure to install this via `npm install dayjs`
import dayjs from 'dayjs';

// Be sure to install this via `npm install @react-native-community/datetimepicker`

const Home = () => {
  // States for form data
  const [formData, setFormData] = useState({
    topics: '',
    trendingTopic: '',
    country: ''
  });
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isFetchingTrendingTopics, setIsFetchingTrendingTopics] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [showGenerated, setShowGenerated] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [usedPersona, setUsedPersona] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showScheduling, setShowScheduling] = useState(false);
  const [scheduledDatetime, setScheduledDatetime] = useState(new Date());
  const [showAllTrending, setShowAllTrending] = useState(false);
  const [showPostNowModal, setShowPostNowModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Dropdown states
  const [openTopics, setOpenTopics] = useState(false);
  const [openCountries, setOpenCountries] = useState(false);

  // Topics and countries data
  const topicsList = [
    { label: 'Select Topic', value: '' },
    { label: 'Business', value: 'business' },
    { label: 'Entertainment', value: 'entertainment' },
    { label: 'General', value: 'general' },
    { label: 'Health', value: 'health' },
    { label: 'Science', value: 'science' },
    { label: 'Sports', value: 'sports' },
    { label: 'Technology', value: 'technology' },
  ];

  const countriesList = [
    { label: 'Select Country', value: '' },
    { label: 'Australia', value: 'au' },
    { label: 'Brazil', value: 'br' },
    { label: 'Canada', value: 'ca' },
    { label: 'China', value: 'cn' },
    { label: 'Egypt', value: 'eg' },
    { label: 'France', value: 'fr' },
    { label: 'Germany', value: 'de' },
    { label: 'Greece', value: 'gr' },
    { label: 'Hong Kong', value: 'hk' },
    { label: 'India', value: 'in' },
    { label: 'Ireland', value: 'ie' },
    { label: 'Israel', value: 'il' },
    { label: 'Italy', value: 'it' },
    { label: 'Japan', value: 'jp' },
    { label: 'Netherlands', value: 'nl' },
    { label: 'Norway', value: 'no' },
    { label: 'Pakistan', value: 'pk' },
    { label: 'Peru', value: 'pe' },
    { label: 'Philippines', value: 'ph' },
    { label: 'Portugal', value: 'pt' },
    { label: 'Romania', value: 'ro' },
    { label: 'Russia', value: 'ru' },
    { label: 'Singapore', value: 'sg' },
    { label: 'Spain', value: 'es' },
    { label: 'Sweden', value: 'se' },
    { label: 'Switzerland', value: 'ch' },
    { label: 'Taiwan', value: 'tw' },
    { label: 'Ukraine', value: 'ua' },
    { label: 'UK', value: 'gb' },
    { label: 'USA', value: 'us' },
  ];

  // Formatting functions
  const applyFormat = (format) => {
    let newContent = editorContent;
    switch(format) {
      case 'bold':
        newContent += ' **bold text** ';
        break;
      case 'italic':
        newContent += ' *italic text* ';
        break;
      case 'heading':
        newContent += '\n# Heading\n';
        break;
      case 'list':
        newContent += '\n- List item\n';
        break;
      default:
        break;
    }
    setEditorContent(newContent);
  };

  // Fetch trending topics when topic or country changes
  useEffect(() => {
    if (formData.topics && formData.country) {
      fetchTrendingTopics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.topics, formData.country]);

  const fetchTrendingTopics = async () => {
    setIsFetchingTrendingTopics(true);
    try {
      // Currently using mock data for demonstration.
      // Replace this with a real fetch call if you have an API for trending topics.
      const mockData = {
        trending_topics: [
          { title: `Latest development in ${formData.topics} for ${formData.country}`, source: 'News API' },
          { title: `How ${formData.topics} is changing in ${formData.country}`, source: 'Trends API' },
          { title: `Top 5 ${formData.topics} updates this week in ${formData.country}`, source: 'Media Corp' },
          { title: `New regulations in ${formData.topics} sector for ${formData.country}`, source: 'Gov News' },
          { title: `Experts weigh in on ${formData.topics} trends in ${formData.country}`, source: 'Expert Opinions' },
          { title: `Investment opportunities in ${formData.topics} for ${formData.country}`, source: 'Financial Times' },
          { title: `Consumer behavior shifts in ${formData.topics} within ${formData.country}`, source: 'Market Research' },
        ]
      };

      setTrendingTopics(mockData.trending_topics);

      // Auto-select first topic and generate post
      if (mockData.trending_topics.length > 0 && !showGenerated) {
        const firstTopic = mockData.trending_topics[0].title;
        setFormData(prev => ({ ...prev, trendingTopic: firstTopic }));
        autoGeneratePost(firstTopic);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch trending topics');
      setTrendingTopics([]);
    } finally {
      setIsFetchingTrendingTopics(false);
    }
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value, trendingTopic: '' }));
    setEditorContent('');
    setShowGenerated(false);
    setUsedPersona('');
    setCustomPrompt('');
    setCustomTopic('');
  };

  const handleTopicClick = (topicTitle) => {
    setFormData(prev => ({ ...prev, trendingTopic: topicTitle }));
    setCustomTopic(topicTitle);
    autoGeneratePost(topicTitle);
  };

  /**
   * Call the /api/generate-post endpoint to generate a post based on a topic,
   * category (formData.topics), and country (formData.country).
   */
  const autoGeneratePost = async (topic) => {
    if (!topic) return;
    setIsGenerating(true);
    setEditorContent('');
    setShowGenerated(false);
    setUsedPersona('');
    setCustomPrompt('');

    try {
      const response = await fetch('https://ai.brannovate.com/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          category: formData.topics,
          country: formData.country,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      // Expecting: { post: string, inspired_by?: string, custom_prompt?: string }
      if (data.post) {
        setEditorContent(data.post);
        setUsedPersona(data.inspired_by || '');
        setCustomPrompt(data.custom_prompt || '');
        setShowGenerated(true);
      }
    } catch (err) {
      Alert.alert('Error', 'Error generating post');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegeneratePost = () => {
    if (!customTopic.trim()) {
      Alert.alert('Error', 'Please enter a topic first!');
      return;
    }
    setEditorContent('');
    setShowGenerated(false);
    setUsedPersona('');
    setCustomPrompt('');
    setShowScheduling(false);
    autoGeneratePost(customTopic);
  };

  const handlePublish = async (option) => {
    if (!editorContent.trim()) {
      Alert.alert('Error', 'Post content is empty');
      return;
    }
    setIsPublishing(true);

    try {
      // Simulate API call to publish or schedule post
      // Replace with your real publish/schedule endpoint if needed
      setTimeout(() => {
        Alert.alert(
          'Success',
          option === 'now' ? 'Post published successfully!' : 'Post scheduled successfully!'
        );
        setIsPublishing(false);
        setShowPostNowModal(false);
        setShowScheduling(false);
      }, 1500);
    } catch (error) {
      Alert.alert('Error', 'Failed to publish post');
      setIsPublishing(false);
    }
  };

  const openScheduleModal = () => {
    setScheduledDatetime(new Date());
    setShowScheduling(true);
  };

  const handleSignIn = () => {
    Linking.openURL('https://www.linkedin.com/oauth/v2/authorization');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Write & schedule {'\n'}
          <Text style={styles.headerHighlight}>your LinkedIn Post with AI</Text>
        </Text>
        <Text style={styles.headerSubtitle}>
          Save time and boost your LinkedIn presence with our AI-powered tool!
        </Text>
      </View>

      {/* Custom Topic Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Generate Your own LinkedIn Post:</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.topicInput}
            placeholder="Enter custom topic here..."
            value={customTopic}
            onChangeText={setCustomTopic}
          />
          <TouchableOpacity
            style={styles.generateButton}
            onPress={() => {
              if (!customTopic.trim()) {
                Alert.alert('Error', 'Please enter a custom topic.');
                return;
              }
              autoGeneratePost(customTopic);
            }}
          >
            <Text style={styles.generateButtonText}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Text Editor */}
      <View style={styles.editorContainer}>
        <TextInput
          style={styles.editor}
          multiline
          placeholder="Write your post here..."
          value={editorContent}
          onChangeText={setEditorContent}
          textAlignVertical="top"
        />

        {/* Formatting Toolbar */}
        <View style={styles.formatToolbar}>
          <TouchableOpacity
            style={styles.formatButton}
            onPress={() => applyFormat('bold')}
          >
            <Text style={styles.formatButtonText}>B</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.formatButton}
            onPress={() => applyFormat('italic')}
          >
            <Text style={styles.formatButtonText}>I</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.formatButton}
            onPress={() => applyFormat('heading')}
          >
            <Text style={styles.formatButtonText}>H</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.formatButton}
            onPress={() => applyFormat('list')}
          >
            <Text style={styles.formatButtonText}>•</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Media Picker (placeholder) */}
      <TouchableOpacity style={styles.mediaButton}>
        <Text style={styles.mediaButtonText}>Add Media</Text>
      </TouchableOpacity>

      {/* Persona and Prompt Info */}
      {showGenerated && usedPersona && (
        <Text style={styles.personaText}>Persona used: {usedPersona}</Text>
      )}

      {customPrompt && (
        <View style={styles.promptContainer}>
          <Text style={styles.promptTitle}>Custom Prompt:</Text>
          <Text style={styles.promptText}>{customPrompt}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            !showGenerated && styles.disabledButton
          ]}
          onPress={handleRegeneratePost}
          disabled={!customTopic.trim()}
        >
          <Text style={styles.actionButtonText}>Redo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            (!editorContent.trim()) && styles.disabledButton
          ]}
          onPress={openScheduleModal}
          disabled={!editorContent.trim()}
        >
          <Text style={styles.actionButtonText}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.primaryAction,
            (!editorContent.trim()) && styles.disabledButton
          ]}
          onPress={() => {
            if (!editorContent.trim()) {
              Alert.alert('Error', 'Your post content is empty.');
              return;
            }
            setShowPostNowModal(true);
          }}
          disabled={!editorContent.trim()}
        >
          <Text style={[styles.actionButtonText, styles.primaryActionText]}>Post Now</Text>
        </TouchableOpacity>
      </View>

      {/* Topic and Country Selectors */}
      <View style={styles.selectorSection}>
        <Text style={styles.selectorTitle}>Select Emerging News Category:</Text>
        <DropDownPicker
          open={openTopics}
          value={formData.topics}
          items={topicsList}
          setOpen={setOpenTopics}
          setValue={(callback) => {
            const value = callback(formData.topics);
            handleSelectChange('topics', value);
          }}
          placeholder="Select Topic"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={3000}
          zIndexInverse={1000}
        />
      </View>

      <View style={styles.selectorSection}>
        <Text style={styles.selectorTitle}>Select Country:</Text>
        <DropDownPicker
          open={openCountries}
          value={formData.country}
          items={countriesList}
          setOpen={setOpenCountries}
          setValue={(callback) => {
            const value = callback(formData.country);
            handleSelectChange('country', value);
          }}
          placeholder="Select Country"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={2000}
          zIndexInverse={2000}
        />
      </View>

      {/* Trending Topics List */}
      {formData.topics && formData.country && (
        <View style={styles.trendingSection}>
          <Text style={styles.trendingTitle}>
            Trending in {formData.topics.charAt(0).toUpperCase() + formData.topics.slice(1)} ({formData.country.toUpperCase()}):
          </Text>

          {isFetchingTrendingTopics ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" />
              <Text style={styles.loadingText}>Searching Trending Topics</Text>
            </View>
          ) : trendingTopics.length > 0 ? (
            <>
              <FlatList
                data={showAllTrending ? trendingTopics : trendingTopics.slice(0, 5)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.topicItem}
                    onPress={() => handleTopicClick(item.title)}
                  >
                    <Text style={styles.topicTitle}>{item.title}</Text>
                    <Text style={styles.topicSource}>{item.source}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
              />

              {!showAllTrending && trendingTopics.length > 5 && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllTrending(true)}
                >
                  <Text style={styles.showMoreText}>Show More</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Text style={styles.noTopicsText}>No trending topics found. Please try again later.</Text>
          )}
        </View>
      )}

      {/* Post Now Modal */}
      <Modal visible={showPostNowModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPostNowModal(false)}
            >
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Review Your Post</Text>

            <View style={styles.postPreview}>
              <Text>{editorContent}</Text>
            </View>

            <TouchableOpacity
              style={[styles.publishButton, isPublishing && styles.disabledButton]}
              onPress={() => handlePublish('now')}
              disabled={isPublishing}
            >
              <Text style={styles.publishButtonText}>
                {isPublishing ? 'Publishing...' : 'Publish on LinkedIn'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Schedule Post Modal */}
      <Modal visible={showScheduling} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowScheduling(false)}
            >
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Schedule Post</Text>

            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {dayjs(scheduledDatetime).format('MMMM D, YYYY h:mm A')}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={scheduledDatetime}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setScheduledDatetime(selectedDate);
                  }
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowScheduling(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.scheduleButton,
                  isPublishing && styles.disabledButton
                ]}
                onPress={() => handlePublish('scheduled')}
                disabled={isPublishing}
              >
                <Text style={styles.scheduleButtonText}>
                  {isPublishing ? 'Scheduling...' : 'Schedule'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerHighlight: {
    color: '#D60000',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  generateButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0014FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  editorContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  editor: {
    minHeight: 200,
    padding: 12,
    textAlignVertical: 'top',
  },
  formatToolbar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 8,
  },
  formatButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  formatButtonText: {
    fontWeight: 'bold',
  },
  mediaButton: {
    backgroundColor: '#0014FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  mediaButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  personaText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 8,
  },
  promptContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  promptTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  promptText: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ddd',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontWeight: 'bold',
  },
  primaryAction: {
    backgroundColor: '#0014FF',
  },
  primaryActionText: {
    color: '#fff',
  },
  selectorSection: {
    marginBottom: 16,
    zIndex: 1000,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 8,
  },
  dropdownContainer: {
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 4,
  },
  trendingSection: {
    marginBottom: 24,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  loadingText: {
    marginLeft: 8,
  },
  topicItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topicTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  topicSource: {
    fontSize: 12,
    color: '#666',
  },
  showMoreButton: {
    padding: 12,
    backgroundColor: '#0014FF',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  showMoreText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noTopicsText: {
    textAlign: 'center',
    color: '#666',
    padding: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#666',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  postPreview: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  publishButton: {
    backgroundColor: '#0014FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  publishButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  datePickerText: {
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#ddd',
  },
  cancelButtonText: {
    fontWeight: 'bold',
  },
  scheduleButton: {
    backgroundColor: '#0014FF',
  },
  scheduleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Home;
