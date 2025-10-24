"""
Treatment Recommendation Service
Load disease information and provide treatment recommendations
"""
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)


class RecommendationService:
    """Provide treatment recommendations based on disease classification"""
    
    def __init__(self, disease_info_path: str = None, treatments_path: str = None):
        """
        Initialize recommendation service
        
        Args:
            disease_info_path: Path to disease_info.json
            treatments_path: Path to treatments.json
        """
        self.disease_info_path = disease_info_path or 'data/disease_info.json'
        self.treatments_path = treatments_path or 'data/treatments.json'
        
        self.disease_database = {}
        self.treatments_database = {}
        self._load_databases()
    
    def _load_databases(self):
        """Load disease and treatment databases"""
        try:
            # Load disease information
            disease_path = Path(self.disease_info_path)
            if disease_path.exists():
                with open(disease_path, 'r') as f:
                    self.disease_database = json.load(f)
                logger.info(f"Loaded {len(self.disease_database)} disease entries")
            else:
                logger.warning(f"Disease info file not found: {disease_path}")
                self._create_default_disease_db()
            
            # Load treatments
            treatments_path = Path(self.treatments_path)
            if treatments_path.exists():
                with open(treatments_path, 'r') as f:
                    self.treatments_database = json.load(f)
                logger.info(f"Loaded {len(self.treatments_database)} treatment entries")
            else:
                logger.warning(f"Treatments file not found: {treatments_path}")
                self._create_default_treatments_db()
                
        except Exception as e:
            logger.error(f"Failed to load databases: {str(e)}")
            self._create_default_disease_db()
            self._create_default_treatments_db()
    
    def get_recommendation(self, crop: str, disease: str, confidence: float) -> Dict[str, Any]:
        """
        Get treatment recommendation for detected disease
        
        Args:
            crop: Crop name (e.g., "Tomato")
            disease: Disease name (e.g., "Late Blight")
            confidence: Prediction confidence (0-1)
            
        Returns:
            Dictionary with recommendations
        """
        try:
            # Create lookup key
            key = f"{crop.lower()}_{disease.lower().replace(' ', '_')}"
            
            # Get disease info
            disease_info = self.disease_database.get(key, {})
            
            # Get treatments
            treatment_info = self.treatments_database.get(key, {})
            
            # Build recommendation
            recommendation = {
                'crop': crop,
                'disease': disease,
                'confidence': confidence,
                'severity': self._assess_severity(disease_info, confidence),
                'description': disease_info.get('description', 'No description available'),
                'symptoms': disease_info.get('symptoms', []),
                'causes': disease_info.get('causes', []),
                'chemical_treatment': treatment_info.get('chemical', 'Consult agricultural expert'),
                'organic_treatment': treatment_info.get('organic', 'Practice crop rotation and proper spacing'),
                'preventive_measures': treatment_info.get('preventive', []),
                'summary': self._create_summary(crop, disease, confidence, treatment_info)
            }
            
            logger.info(f"Generated recommendation for {crop} - {disease}")
            return recommendation
            
        except Exception as e:
            logger.error(f"Failed to generate recommendation: {str(e)}")
            return self._get_default_recommendation(crop, disease, confidence)
    
    def _assess_severity(self, disease_info: Dict, confidence: float) -> str:
        """
        Assess disease severity based on info and confidence
        
        Args:
            disease_info: Disease information dict
            confidence: Prediction confidence
            
        Returns:
            Severity level: 'low', 'medium', 'high', 'critical'
        """
        base_severity = disease_info.get('severity', 'medium')
        
        # Adjust based on confidence
        if confidence < 0.6:
            return 'low'
        elif confidence < 0.8:
            return base_severity
        else:
            # High confidence
            if base_severity == 'medium':
                return 'high'
            return base_severity
    
    def _create_summary(self, crop: str, disease: str, confidence: float, 
                       treatment_info: Dict) -> str:
        """Create concise treatment summary"""
        primary_treatment = treatment_info.get('chemical') or treatment_info.get('organic')
        
        if primary_treatment:
            return f"Apply {primary_treatment}"
        elif 'healthy' in disease.lower():
            return "Plant is healthy. Continue regular maintenance."
        else:
            return "Consult agricultural expert for proper diagnosis and treatment."
    
    def _create_default_disease_db(self):
        """Create default disease database"""
        self.disease_database = {
            'tomato_late_blight': {
                'description': 'Fungal disease causing dark lesions on leaves and fruit',
                'symptoms': ['Dark water-soaked lesions', 'White mold growth', 'Rapid spread'],
                'causes': ['High humidity', 'Cool temperatures', 'Poor air circulation'],
                'severity': 'high'
            },
            'tomato_early_blight': {
                'description': 'Fungal disease causing concentric ring patterns on leaves',
                'symptoms': ['Brown spots with concentric rings', 'Yellowing leaves', 'Defoliation'],
                'causes': ['Warm humid weather', 'Overhead watering', 'Poor nutrition'],
                'severity': 'medium'
            },
            'tomato_healthy': {
                'description': 'Plant shows no signs of disease',
                'symptoms': ['Vibrant green leaves', 'Normal growth', 'No lesions'],
                'causes': [],
                'severity': 'low'
            }
        }
    
    def _create_default_treatments_db(self):
        """Create default treatments database"""
        self.treatments_database = {
            'tomato_late_blight': {
                'chemical': 'copper-based fungicide or chlorothalonil',
                'organic': 'neem oil and remove infected plants immediately',
                'preventive': [
                    'Use resistant varieties',
                    'Improve air circulation',
                    'Avoid overhead watering',
                    'Remove infected plant debris'
                ]
            },
            'tomato_early_blight': {
                'chemical': 'chlorothalonil or mancozeb fungicide',
                'organic': 'copper spray or baking soda solution',
                'preventive': [
                    'Mulch around plants',
                    'Water at soil level',
                    'Rotate crops annually',
                    'Maintain plant nutrition'
                ]
            },
            'tomato_healthy': {
                'chemical': None,
                'organic': None,
                'preventive': [
                    'Continue regular watering',
                    'Maintain proper nutrition',
                    'Monitor for pests',
                    'Ensure good air circulation'
                ]
            }
        }
    
    def _get_default_recommendation(self, crop: str, disease: str, confidence: float) -> Dict[str, Any]:
        """Fallback recommendation when disease info not found"""
        return {
            'crop': crop,
            'disease': disease,
            'confidence': confidence,
            'severity': 'medium',
            'description': 'Disease information not available in database',
            'symptoms': [],
            'causes': [],
            'chemical_treatment': 'Consult agricultural expert',
            'organic_treatment': 'Practice integrated pest management',
            'preventive_measures': [
                'Monitor plant health regularly',
                'Maintain proper watering',
                'Ensure good air circulation',
                'Remove infected plant material'
            ],
            'summary': 'Consult agricultural expert for proper diagnosis and treatment'
        }


# Singleton instance
recommendation_service = RecommendationService()
