"""
Metrics Service - Calculates quality metrics for LLM responses
"""
import re
from typing import Dict, List
import math


class MetricsService:
    """Service for calculating response quality metrics"""
    
    def calculate_all_metrics(self, text: str) -> Dict[str, Dict]:
        """
        Calculate all quality metrics for a response
        
        Returns:
            Dictionary mapping metric names to their values and metadata
        """
        return {
            "length_score": self.calculate_length_score(text),
            "coherence_score": self.calculate_coherence_score(text),
            "completeness_score": self.calculate_completeness_score(text),
            "structure_score": self.calculate_structure_score(text),
            "readability_score": self.calculate_readability_score(text),
            "overall_score": self.calculate_overall_score(text)
        }
    
    def calculate_length_score(self, text: str) -> Dict:
        """
        Calculate length appropriateness score
        - Too short: < 50 chars
        - Good: 50-2000 chars
        - Too long: > 2000 chars
        """
        length = len(text)
        
        if length < 50:
            score = max(0.0, length / 50.0)  # Linear scale from 0-50
        elif length <= 2000:
            score = 1.0  # Optimal length
        else:
            # Penalize very long responses
            excess = length - 2000
            score = max(0.0, 1.0 - (excess / 5000.0))  # Gradual penalty
        
        return {
            "value": round(score, 3),
            "metadata": {"length": length, "optimal_range": "50-2000"}
        }
    
    def calculate_coherence_score(self, text: str) -> Dict:
        """
        Calculate coherence score based on:
        - Sentence structure
        - Transition words
        - Punctuation usage
        """
        sentences = re.split(r'[.!?]+', text.strip())
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if len(sentences) < 2:
            return {"value": 0.5, "metadata": {"reason": "Too few sentences"}}
        
        # Check for transition words (coherence indicators)
        transition_words = [
            'however', 'therefore', 'furthermore', 'moreover', 'additionally',
            'consequently', 'thus', 'hence', 'meanwhile', 'subsequently',
            'also', 'but', 'and', 'or', 'because', 'since', 'although'
        ]
        
        transition_count = sum(
            1 for word in transition_words
            if word.lower() in text.lower()
        )
        
        # Check sentence structure (capitalization, punctuation)
        proper_sentences = sum(
            1 for s in sentences
            if s and (s[0].isupper() or s[0].isdigit())
        )
        structure_score = proper_sentences / len(sentences) if sentences else 0
        
        # Combine factors
        transition_score = min(1.0, transition_count / 5.0)  # Normalize to 0-1
        coherence = (structure_score * 0.7 + transition_score * 0.3)
        
        return {
            "value": round(coherence, 3),
            "metadata": {
                "sentence_count": len(sentences),
                "transition_words": transition_count,
                "proper_sentences": proper_sentences
            }
        }
    
    def calculate_completeness_score(self, text: str) -> Dict:
        """
        Calculate completeness score based on:
        - Question answering (if prompt was a question)
        - Presence of key information markers
        - Conclusion indicators
        """
        # Check for conclusion indicators
        conclusion_indicators = [
            'in conclusion', 'to summarize', 'in summary', 'overall',
            'finally', 'in summary', 'to sum up'
        ]
        has_conclusion = any(
            indicator in text.lower()
            for indicator in conclusion_indicators
        )
        
        # Check for question markers (if it's answering questions)
        question_words = ['what', 'why', 'how', 'when', 'where', 'who', 'which']
        has_answers = any(
            word in text.lower()[:200]  # Check first 200 chars
            for word in question_words
        )
        
        # Length-based completeness (longer responses might be more complete)
        length_factor = min(1.0, len(text) / 500.0)
        
        # Combine factors
        completeness = (
            (1.0 if has_conclusion else 0.7) * 0.4 +
            (1.0 if has_answers else 0.6) * 0.3 +
            length_factor * 0.3
        )
        
        return {
            "value": round(completeness, 3),
            "metadata": {
                "has_conclusion": has_conclusion,
                "has_answers": has_answers,
                "length_factor": round(length_factor, 3)
            }
        }
    
    def calculate_structure_score(self, text: str) -> Dict:
        """
        Calculate structure score based on:
        - Paragraph breaks
        - List formatting
        - Headers/sections
        """
        # Count paragraphs
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        paragraph_score = min(1.0, len(paragraphs) / 3.0) if paragraphs else 0.5
        
        # Check for list formatting
        list_indicators = re.findall(r'^\s*[-*•\d+\.]\s+', text, re.MULTILINE)
        list_score = min(1.0, len(list_indicators) / 3.0)
        
        # Check for section headers (lines in caps or with colons)
        lines = text.split('\n')
        header_like = sum(
            1 for line in lines[:10]  # Check first 10 lines
            if (line.strip().isupper() and len(line.strip()) < 50) or ':' in line[:50]
        )
        header_score = min(1.0, header_like / 2.0)
        
        # Combine factors
        structure = (
            paragraph_score * 0.5 +
            list_score * 0.3 +
            header_score * 0.2
        )
        
        return {
            "value": round(structure, 3),
            "metadata": {
                "paragraphs": len(paragraphs),
                "list_items": len(list_indicators),
                "header_like": header_like
            }
        }
    
    def calculate_readability_score(self, text: str) -> Dict:
        """
        Calculate readability score using simplified Flesch-like metrics
        - Average sentence length
        - Average word length
        - Vocabulary diversity
        """
        sentences = re.split(r'[.!?]+', text.strip())
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not sentences:
            return {"value": 0.0, "metadata": {"reason": "No sentences"}}
        
        # Calculate average sentence length
        words = re.findall(r'\b\w+\b', text.lower())
        if not words:
            return {"value": 0.0, "metadata": {"reason": "No words"}}
        
        avg_sentence_length = len(words) / len(sentences) if sentences else 0
        
        # Calculate average word length
        avg_word_length = sum(len(word) for word in words) / len(words)
        
        # Vocabulary diversity (unique words / total words)
        unique_words = len(set(words))
        diversity = unique_words / len(words) if words else 0
        
        # Flesch-like score (simplified)
        # Optimal: 10-20 words/sentence, 4-5 chars/word
        sentence_score = 1.0 - abs(avg_sentence_length - 15) / 15.0
        sentence_score = max(0.0, min(1.0, sentence_score))
        
        word_score = 1.0 - abs(avg_word_length - 4.5) / 2.0
        word_score = max(0.0, min(1.0, word_score))
        
        readability = (
            sentence_score * 0.4 +
            word_score * 0.3 +
            diversity * 0.3
        )
        
        return {
            "value": round(readability, 3),
            "metadata": {
                "avg_sentence_length": round(avg_sentence_length, 2),
                "avg_word_length": round(avg_word_length, 2),
                "vocabulary_diversity": round(diversity, 3),
                "unique_words": unique_words,
                "total_words": len(words)
            }
        }
    
    def calculate_overall_score(self, text: str) -> Dict:
        """
        Calculate overall quality score (weighted average of all metrics)
        Note: This calculates metrics directly to avoid circular recursion
        """
        # Calculate individual metrics directly (don't call calculate_all_metrics)
        length_score = self.calculate_length_score(text)["value"]
        coherence_score = self.calculate_coherence_score(text)["value"]
        completeness_score = self.calculate_completeness_score(text)["value"]
        structure_score = self.calculate_structure_score(text)["value"]
        readability_score = self.calculate_readability_score(text)["value"]
        
        # Weights for different metrics
        weights = {
            "length_score": 0.15,
            "coherence_score": 0.25,
            "completeness_score": 0.20,
            "structure_score": 0.15,
            "readability_score": 0.25
        }
        
        # Calculate weighted average
        overall = (
            length_score * weights["length_score"] +
            coherence_score * weights["coherence_score"] +
            completeness_score * weights["completeness_score"] +
            structure_score * weights["structure_score"] +
            readability_score * weights["readability_score"]
        )
        
        return {
            "value": round(overall, 3),
            "metadata": {
                "component_scores": {
                    "length_score": length_score,
                    "coherence_score": coherence_score,
                    "completeness_score": completeness_score,
                    "structure_score": structure_score,
                    "readability_score": readability_score
                }
            }
        }
