import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Button,
  Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import DropDownPicker from 'react-native-dropdown-picker';

// Import local assets (adjust paths as needed)
import logoLoader from '../assets/img/logo-glitch.gif';
import profileImg from '../assets/img/user-default.jpg';
// For demonstration, we assume these SVGs are available as images:
import thumbImg from '../assets/img/heart.svg';
import heartImg from '../assets/img/thumb.svg';

const scheduleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: [{ translateX: -0.5 * 300 }, { translateY: -0.5 * 400 }], // approximate dimensions
  backgroundColor: "#fff",
  borderRadius: 8,
  padding: 16,
  elevation: 5,
};

const postModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: [{ translateX: -0.5 * 250 }, { translateY: -0.5 * 350 }],
  backgroundColor: "#fff",
  borderRadius: 8,
  padding: 16,
  elevation: 5,
};

const Home = () => {
  const navigation = useNavigation();

  // States for original logic
  const [formData, setFormData] = useState({ topics: '', trendingTopic: '', country: '' });
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isFetchingTrendingTopics, setIsFetchingTrendingTopics] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [showGenerated, setShowGenerated] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [usedPersona, setUsedPersona] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [mediaData, setMediaData] = useState(null);
  const [mediaType, setMediaType] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [showScheduling, setShowScheduling] = useState(false);
  const [scheduledDatetime, setScheduledDatetime] = useState(new Date());
  const [scheduledTimezone, setScheduledTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showAllTrending, setShowAllTrending] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [showPostNowModal, setShowPostNowModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Dropdown states for emerging news category and country
  const [openTopics, setOpenTopics] = useState(false);
  const [openCountries, setOpenCountries] = useState(false);

  // Dropdown items arrays
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
    { label: 'Russian Federation', value: 'ru' },
    { label: 'Singapore', value: 'sg' },
    { label: 'Spain', value: 'es' },
    { label: 'Sweden', value: 'se' },
    { label: 'Switzerland', value: 'ch' },
    { label: 'Taiwan', value: 'tw' },
    { label: 'Ukraine', value: 'ua' },
    { label: 'United Kingdom', value: 'gb' },
    { label: 'United States', value: 'us' },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('https://ai.brannovate.com/api/profile', { credentials: 'include' });
      const data = await res.json();
      if (!data.error) {
        setUserProfile(data);
      }
    } catch (err) {
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile) {
      fetchScheduledPosts();
    }
  }, [userProfile]);

  useEffect(() => {
    if (formData.topics && formData.country) {
      setIsFetchingTrendingTopics(true);
      fetch('https://ai.brannovate.com/api/generate-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formData.topics,
          country: formData.country,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            const trending = data.trending_topics || [];
            setTrendingTopics(trending);
            // Automatically generate post using the first trending topic if available and not already generated.
            if (trending.length > 0 && !showGenerated) {
              const firstTopic = trending[0].title;
              setFormData(prev => ({ ...prev, trendingTopic: firstTopic }));
              autoGeneratePost(firstTopic);
            }
          }
        })
        .catch(() => setTrendingTopics([]))
        .finally(() => setIsFetchingTrendingTopics(false));
    }
  }, [formData.topics, formData.country]);

  const fetchScheduledPosts = async () => {
    try {
      const res = await fetch('https://ai.brannovate.com/api/user-scheduled-posts', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setScheduledPosts(data.scheduled_posts || []);
      }
    } catch (err) {
      Alert.alert('Error', 'Error fetching scheduled posts');
    }
  };

  const handleSelectChange = (field, value) => {
    // Update the dropdown value and clear trendingTopic & editor content
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

  const autoGeneratePost = async (topic) => {
    if (!topic) return;
    setIsGenerating(true);
    setEditorContent('');
    setShowGenerated(false);
    setUsedPersona('');
    setCustomPrompt('');
    try {
      const res = await fetch('https://ai.brannovate.com/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (res.ok && data.post) {
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

  // Placeholder for media picking
  const handleMediaPick = async () => {
    Alert.alert('Media Picker', 'Media picker is not implemented in this demo.');
  };

  const handlePublish = async (option) => {
    if (!editorContent.trim()) {
      Alert.alert('Error', 'Post content is empty');
      return;
    }
    setIsPublishing(true);
    const data = new FormData();
    data.append('topic', formData.trendingTopic);
    data.append('schedule', option);
    data.append('post', editorContent);

    if (mediaFile) {
      data.append('media', {
        uri: mediaData,
        type: mediaType === 'video' ? 'video/mp4' : mediaFile.type,
        name: 'upload.' + (mediaType === 'image' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'pdf'),
      });
    }

    if (option === 'scheduled') {
      if (!scheduledDatetime) {
        Alert.alert('Error', 'Please select a date/time');
        setIsPublishing(false);
        return;
      }
      data.append('scheduled_datetime', scheduledDatetime.toISOString());
      data.append('timezone', scheduledTimezone);
    }

    try {
      const res = await fetch('https://ai.brannovate.com/api/post', {
        method: 'POST',
        body: data,
        credentials: 'include',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const response = await res.json();
      if (res.ok) {
        Alert.alert('Success', response.message || 'Success!');
        resetForm();
        if (option === 'scheduled') fetchScheduledPosts();
      } else {
        Alert.alert('Error', response.error || 'Error publishing');
      }
    } catch (error) {
      Alert.alert('Error', 'Error publishing');
    } finally {
      setIsPublishing(false);
      setShowPostNowModal(false);
    }
  };

  const resetForm = () => {
    setEditorContent('');
    setMediaData(null);
    setMediaType('');
    setMediaFile(null);
    setFormData({ topics: '', trendingTopic: '', country: '' });
    setTrendingTopics([]);
    setScheduledDatetime(new Date());
    setScheduledTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setShowPostNowModal(false);
    setShowScheduling(false);
    setUsedPersona('');
    setCustomPrompt('');
    setCustomTopic('');
  };

  const openScheduleModal = () => {
    setScheduledDatetime(new Date());
    setScheduledTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setShowScheduling(true);
  };

  const handleSignIn = () => {
    Linking.openURL('https://ai.brannovate.com/api/linkedin-login');
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.clear();
    setUserProfile(null);
    Alert.alert('Logged out!', 'You have been logged out.');
    navigate("/");
  };

  const handleEditorChange = (value) => {
    const formattedValue = value
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");
    setEditorContent(formattedValue);
  };

  if (profileLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Write &amp; schedule{'\n'}
          <Text style={styles.highlight}>your LinkedIn Post with AI</Text>
        </Text>
        <Text style={styles.subtitle}>
          Save time and boost your LinkedIn presence with our AI-powered tool!
        </Text>

        {!userProfile ? (
          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Sign in with LinkedIn</Text>
          </TouchableOpacity>
        ) : (
          <View>
            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <Image source={logoLoader} style={styles.loader} />
                <Text>Generating LinkedIn Post...</Text>
              </View>
            ) : (
              <View style={styles.formContainer}>
                {/* Custom Topic Input */}
                <Text style={styles.label}>Generate Your own Linkedin Post:</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Enter custom topic here..."
                    value={customTopic}
                    onChangeText={setCustomTopic}
                  />
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => {
                      if (!customTopic.trim()) {
                        Alert.alert('Error', 'Please enter a custom topic.');
                        return;
                      }
                      autoGeneratePost(customTopic);
                    }}
                  >
                    <Text style={styles.iconText}>↑</Text>
                  </TouchableOpacity>
                </View>

                {/* Editor */}
                <TextInput
                  style={styles.editor}
                  multiline
                  placeholder="Your AI-generated or custom text will appear here..."
                  value={editorContent}
                  onChangeText={handleEditorChange}
                />

                {/* Media Picker */}
                <TouchableOpacity onPress={handleMediaPick} style={styles.mediaButton}>
                  <Text style={styles.mediaButtonText}>Pick Media</Text>
                </TouchableOpacity>

                {showGenerated && usedPersona ? (
                  <Text style={styles.personaText}>Persona used: {usedPersona}</Text>
                ) : null}

                {customPrompt ? (
                  <View style={styles.promptContainer}>
                    <Text style={styles.promptTitle}>Custom Prompt:</Text>
                    <Text style={styles.promptText}>{customPrompt}</Text>
                  </View>
                ) : null}

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, !showGenerated && { opacity: 0.5 }]}
                    onPress={handleRegeneratePost}
                    disabled={!customTopic.trim()}
                  >
                    <Text style={styles.actionButtonText}>Redo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, (!editorContent.trim()) && { opacity: 0.5 }]}
                    onPress={openScheduleModal}
                    disabled={!editorContent.trim()}
                  >
                    <Text style={styles.actionButtonText}>Schedule post for later</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, (!editorContent.trim()) && { opacity: 0.5 }]}
                    onPress={() => {
                      if (!editorContent.trim()) {
                        Alert.alert('Error', 'Your post content is empty.');
                        return;
                      }
                      setShowPostNowModal(true);
                    }}
                    disabled={!editorContent.trim()}
                  >
                    <Text style={styles.actionButtonText}>Post now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Post Preview */}
        <View style={styles.previewContainer}>
          <View style={styles.profileRow}>
            <Image
              source={userProfile && userProfile.profilePic ? { uri: userProfile.profilePic } : profileImg}
              style={styles.profilePic}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userProfile ? userProfile.name : 'John Doe'}</Text>
              <Text style={styles.profileHeadline}>{userProfile ? userProfile.headline : ''}</Text>
              <Text style={styles.postTime}>Now</Text>
            </View>
          </View>
          <View style={styles.postContent}>
            <Text>
              {editorContent.trim()
                ? editorContent
                : 'Start writing and your post will appear here...'}
            </Text>
          </View>
          {mediaData ? (
            <View style={styles.mediaPreview}>
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={() => {
                  setMediaData(null);
                  setMediaType('');
                  setMediaFile(null);
                }}
              >
                <Text style={styles.removeMediaText}>X</Text>
              </TouchableOpacity>
              {mediaType === 'video' ? (
                <Text>Video Preview (not implemented)</Text>
              ) : mediaType === 'pdf' ? (
                <Text>PDF Preview (not implemented)</Text>
              ) : (
                <Image source={{ uri: mediaData }} style={styles.mediaImage} />
              )}
            </View>
          ) : null}
          <View style={styles.previewStats}>
            <Text>20k Likes, 1k comments, 60 reposts</Text>
          </View>
        </View>

        {/* Post Now Modal */}
        <Modal visible={showPostNowModal} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowPostNowModal(false)}>
                <Text style={styles.modalCloseText}>X</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Review Your Post</Text>
              <View style={styles.previewContainer}>
                <View style={styles.profileRow}>
                  <Image
                    source={userProfile && userProfile.profilePic ? { uri: userProfile.profilePic } : profileImg}
                    style={styles.profilePic}
                  />
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{userProfile ? userProfile.name : 'John Doe'}</Text>
                    <Text style={styles.profileHeadline}>{userProfile ? userProfile.headline : ''}</Text>
                    <Text style={styles.postTime}>Now</Text>
                  </View>
                </View>
                <View style={styles.postContent}>
                  <Text>
                    {editorContent.trim()
                      ? editorContent
                      : 'Start writing and your post will appear here...'}
                  </Text>
                </View>
                {mediaData ? (
                  <View style={styles.mediaPreview}>
                    <TouchableOpacity
                      style={styles.removeMediaButton}
                      onPress={() => {
                        setMediaData(null);
                        setMediaType('');
                      }}
                    >
                      <Text style={styles.removeMediaText}>X</Text>
                    </TouchableOpacity>
                    {mediaType === 'video' ? (
                      <Text>Video Preview (not implemented)</Text>
                    ) : mediaType === 'pdf' ? (
                      <Text>PDF Preview (not implemented)</Text>
                    ) : (
                      <Image source={{ uri: mediaData }} style={styles.mediaImage} />
                    )}
                  </View>
                ) : null}
                <View style={styles.previewStats}>
                  <Text>20k Likes, 1k comments, 60 reposts</Text>
                </View>
              </View>
              <View style={styles.modalActions}>
                <Button
                  title={isPublishing ? "Publishing..." : "Publish on LinkedIn"}
                  onPress={() => handlePublish('now')}
                  disabled={isPublishing}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Schedule Post Modal */}
        <Modal visible={showScheduling} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowScheduling(false)}>
                <Text style={styles.modalCloseText}>X</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Schedule Post</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                <Text style={styles.datePickerText}>{scheduledDatetime.toLocaleString()}</Text>
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
              <View style={styles.modalActions}>
                <Button title="Cancel" onPress={() => setShowScheduling(false)} />
                <Button
                  title={isPublishing ? "Scheduling..." : "Schedule"}
                  onPress={() => handlePublish('scheduled')}
                  disabled={isPublishing}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Dropdowns for Emerging News Category and Country */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>Select Emerging News Category:</Text>
          <DropDownPicker
            open={openTopics}
            value={formData.topics}
            items={topicsList}
            setOpen={setOpenTopics}
            setValue={(value) => handleSelectChange('topics', value)}
            containerStyle={styles.pickerContainer}
            style={styles.dropdown}
            dropDownStyle={styles.dropdown}
            listMode="MODAL"
          />
        </View>
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>Select Country:</Text>
          <DropDownPicker
            open={openCountries}
            value={formData.country}
            items={countriesList}
            setOpen={setOpenCountries}
            setValue={(value) => handleSelectChange('country', value)}
            containerStyle={styles.pickerContainer}
            style={styles.dropdown}
            dropDownStyle={styles.dropdown}
            listMode="MODAL"
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f2f2f2' },
  content: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  highlight: { color: '#D60000' },
  subtitle: { textAlign: 'center', marginVertical: 8 },
  button: { backgroundColor: '#0000FF', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  loader: { width: 45, height: 45, marginRight: 8 },
  formContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginVertical: 8 },
  label: { fontWeight: 'bold', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, marginVertical: 8 },
  iconButton: { backgroundColor: '#0014FF', padding: 10, borderRadius: 20, marginLeft: 8 },
  iconText: { color: '#fff', fontWeight: 'bold' },
  editor: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    height: 100,
    textAlignVertical: 'top'
  },
  mediaButton: { backgroundColor: '#0014FF', padding: 10, borderRadius: 8, alignItems: 'center', marginVertical: 8 },
  mediaButtonText: { color: '#fff', fontWeight: 'bold' },
  personaText: { marginVertical: 4, fontStyle: 'italic' },
  promptContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, backgroundColor: '#f9f9f9' },
  promptTitle: { fontWeight: 'bold' },
  promptText: { fontSize: 12 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 8 },
  actionButton: { padding: 10, borderRadius: 8, backgroundColor: '#ccc' },
  actionButtonText: { fontWeight: 'bold' },
  previewContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginVertical: 8 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  profilePic: { width: 40, height: 40, borderRadius: 20 },
  profileInfo: { marginLeft: 8 },
  profileName: { fontWeight: 'bold' },
  profileHeadline: { fontSize: 12, color: '#666' },
  postTime: { fontSize: 10, color: '#666' },
  postContent: { marginVertical: 8 },
  mediaPreview: { marginVertical: 8, alignItems: 'center' },
  removeMediaButton: { position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 12, padding: 4 },
  removeMediaText: { fontWeight: 'bold' },
  mediaImage: { width: '100%', height: 200, resizeMode: 'contain' },
  previewStats: { marginTop: 8, alignItems: 'center' },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 16 },
  modalContent: { backgroundColor: '#fff', borderRadius: 8, padding: 16 },
  modalCloseButton: { position: 'absolute', top: 8, right: 8 },
  modalCloseText: { fontWeight: 'bold' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  datePickerButton: { padding: 12, backgroundColor: '#eee', borderRadius: 8, alignItems: 'center', marginVertical: 8 },
  datePickerText: { fontSize: 16 },
  selectorContainer: { marginVertical: 8 },
  selectorLabel: { fontWeight: 'bold', marginBottom: 4 },
  pickerContainer: { height: 50 },
  dropdown: { backgroundColor: '#fafafa', borderColor: '#ccc', borderWidth: 1, borderRadius: 4 },
  trendingContainer: { marginVertical: 8 },
  trendingTitle: { fontWeight: 'bold', marginBottom: 4 },
  topicItem: { padding: 8, borderBottomWidth: 1, borderColor: '#ccc' },
  topicTitle: { fontWeight: 'bold' },
  topicSource: { fontSize: 12, color: '#666' },
  noTopicsText: { textAlign: 'center', color: '#666' },
});
