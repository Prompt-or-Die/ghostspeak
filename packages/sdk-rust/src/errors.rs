//! Error types for the podAI SDK
//!
//! This module defines all error types that can occur when using the SDK,
//! providing detailed context and error information for debugging and handling.

use solana_client::client_error::{ClientError, ClientErrorKind};
use solana_client::rpc_request::RpcError;
use solana_sdk::program_error::ProgramError;
use solana_sdk::pubkey::ParsePubkeyError;
use thiserror::Error;

/// Result type alias for podAI SDK operations
pub type PodAIResult<T> = Result<T, PodAIError>;

/// Comprehensive error types for the podAI SDK
#[derive(Error, Debug)]
pub enum PodAIError {
    /// Solana client errors
    #[error("Solana client error: {0}")]
    SolanaClient(#[from] ClientError),

    /// Solana program errors
    #[error("Solana program error: {0}")]
    SolanaProgram(#[from] ProgramError),

    /// Public key parsing errors
    #[error("Invalid public key: {0}")]
    InvalidPubkey(#[from] ParsePubkeyError),

    /// Serialization/deserialization errors
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    /// Borsh serialization errors
    #[error("Borsh serialization error: {0}")]
    BorshSerialization(#[from] borsh::io::Error),

    /// HTTP request errors
    #[error("HTTP request error: {0}")]
    Http(#[from] reqwest::Error),

    /// Configuration error
    #[error("Configuration error: {message}")]
    Configuration { 
        /// Error message
        message: String 
    },

    /// Agent error
    #[error("Agent error: {message}")]
    Agent { 
        /// Error message
        message: String 
    },

    /// Channel error
    #[error("Channel error: {message}")]
    Channel { 
        /// Error message
        message: String 
    },

    /// Message error
    #[error("Message error: {message}")]
    Message { 
        /// Error message
        message: String 
    },

    /// Escrow error
    #[error("Escrow error: {message}")]
    Escrow { 
        /// Error message
        message: String 
    },

    /// Marketplace error
    #[error("Marketplace error: {message}")]
    Marketplace { 
        /// Error message
        message: String 
    },

    /// Account not found error
    #[error("Account not found: {account_type} at address {address}")]
    AccountNotFound { 
        /// Account type
        account_type: String, 
        /// Account address
        address: String,
    },

    /// Account validation error
    #[error("Invalid account data for {account_type}: {reason}")]
    InvalidAccountData {
        /// Account type
        account_type: String,
        /// Reason for validation failure
        reason: String,
    },

    /// Transaction simulation failed
    #[error("Transaction simulation failed: {}", logs.join(", "))]
    TransactionSimulationFailed { 
        /// Simulation logs
        logs: Vec<String> 
    },

    /// Transaction timeout
    #[error("Transaction timeout after {seconds} seconds")]
    TransactionTimeout { 
        /// Timeout in seconds
        seconds: u64 
    },

    /// Insufficient balance
    #[error("Insufficient balance: required {required} lamports, available {available} lamports")]
    InsufficientBalance { 
        /// Required amount
        required: u64, 
        /// Available amount
        available: u64 
    },

    /// Rate limit exceeded
    #[error("Rate limit exceeded: {operation}")]
    RateLimitExceeded { 
        /// Operation name
        operation: String 
    },

    /// Invalid input
    #[error("Invalid input: {field} - {reason}")]
    InvalidInput { 
        /// Field name
        field: String, 
        /// Reason for invalid input
        reason: String 
    },

    /// Network error
    #[error("Network error: {message}")]
    Network { 
        /// Error message
        message: String 
    },

    /// Cryptography error
    #[error("Cryptographic operation failed: {operation}")]
    Cryptography { 
        /// Operation name
        operation: String 
    },

    /// Feature not supported
    #[error("Feature not supported: {feature}")]
    FeatureNotSupported { 
        /// Feature name
        feature: String 
    },

    /// Internal error
    #[error("Internal SDK error: {message}")]
    Internal { 
        /// Error message
        message: String 
    },

    /// Custom error
    #[error("Custom error: {message}")]
    Custom { 
        /// Error message
        message: String 
    },

    /// Transaction failed
    #[error("Transaction failed: {reason}")]
    TransactionFailed { 
        /// Reason for failure
        reason: String, 
        /// Optional transaction signature
        signature: Option<solana_sdk::signature::Signature>, 
        /// Whether the error is retryable
        retryable: bool, 
        /// Optional error code
        error_code: Option<u32> 
    },
    
    #[error("Simulation failed: {error}")]
    SimulationFailed { 
        /// Error message
        error: String 
    },
    
    #[error("Missing payer for transaction")]
    MissingPayer,
    
    #[error("Account size mismatch: expected {expected}, actual {actual}")]
    AccountSizeMismatch { 
        /// Expected size
        expected: usize, 
        /// Actual size
        actual: usize 
    },
    
    #[error("Invalid account discriminator: expected {expected:?}, found {found:?}")]
    InvalidAccountDiscriminator { 
        /// Expected discriminator
        expected: [u8; 8], 
        /// Found discriminator
        found: [u8; 8] 
    },
    
    #[error("Timeout after {duration_ms}ms")]
    Timeout { 
        /// Timeout duration in ms
        duration_ms: u64 
    },
    
    #[error("SPL Token 2022 error: {message}")]
    SplToken2022 { 
        /// Error message
        message: String 
    },
    
    #[error("Priority fee estimation failed: {reason}")]
    PriorityFeeEstimationFailed { 
        /// Reason for failure
        reason: String 
    },
    
    #[error("Instruction building failed: {instruction_type} - {reason}")]
    InstructionBuildingFailed { 
        /// Instruction type
        instruction_type: String, 
        /// Reason for failure
        reason: String 
    },
}

impl PodAIError {
    /// Create a configuration error
    pub fn configuration<S: Into<String>>(message: S) -> Self {
        Self::Configuration {
            message: message.into(),
        }
    }

    /// Create a connection error
    pub fn connection<S: Into<String>>(message: S) -> Self {
        Self::Network {
            message: message.into(),
        }
    }

    /// Create an RPC error
    pub fn rpc<S: Into<String>>(message: S) -> Self {
        Self::Network {
            message: message.into(),
        }
    }

    /// Create a transaction error
    pub fn transaction<S: Into<String>>(message: S) -> Self {
        Self::TransactionFailed {
            reason: message.into(),
            signature: None,
            retryable: true,
            error_code: None,
        }
    }

    /// Create an agent error
    pub fn agent<S: Into<String>>(message: S) -> Self {
        Self::Agent {
            message: message.into(),
        }
    }

    /// Create a channel error
    pub fn channel<S: Into<String>>(message: S) -> Self {
        Self::Channel {
            message: message.into(),
        }
    }

    /// Create a message error
    pub fn message<S: Into<String>>(message: S) -> Self {
        Self::Message {
            message: message.into(),
        }
    }

    /// Create an escrow error
    pub fn escrow<S: Into<String>>(message: S) -> Self {
        Self::Escrow {
            message: message.into(),
        }
    }

    /// Create a marketplace error
    pub fn marketplace<S: Into<String>>(message: S) -> Self {
        Self::Marketplace {
            message: message.into(),
        }
    }

    /// Create a transaction simulation failed error
    pub fn transaction_simulation_failed(logs: Vec<String>) -> Self {
        Self::TransactionSimulationFailed { logs }
    }

    /// Create a transaction timeout error
    pub fn transaction_timeout(seconds: u64) -> Self {
        Self::TransactionTimeout { seconds }
    }

    /// Create an account not found error
    pub fn account_not_found<S: Into<String>>(account_type: S, address: S) -> Self {
        Self::AccountNotFound {
            account_type: account_type.into(),
            address: address.into(),
        }
    }

    /// Create an invalid account data error
    pub fn invalid_account_data<S: Into<String>>(account_type: S, reason: S) -> Self {
        Self::InvalidAccountData {
            account_type: account_type.into(),
            reason: reason.into(),
        }
    }

    /// Create an insufficient balance error
    pub fn insufficient_balance(required: u64, available: u64) -> Self {
        Self::InsufficientBalance { required, available }
    }

    /// Create a rate limit exceeded error
    pub fn rate_limit_exceeded<S: Into<String>>(operation: S) -> Self {
        Self::RateLimitExceeded {
            operation: operation.into(),
        }
    }

    /// Create an invalid input error
    pub fn invalid_input<S: Into<String>>(field: S, reason: S) -> Self {
        Self::InvalidInput {
            field: field.into(),
            reason: reason.into(),
        }
    }

    /// Create a network error
    pub fn network<S: Into<String>>(message: S) -> Self {
        Self::Network {
            message: message.into(),
        }
    }

    /// Create a cryptography error
    pub fn cryptography<S: Into<String>>(operation: S) -> Self {
        Self::Cryptography {
            operation: operation.into(),
        }
    }

    /// Create a feature not supported error
    pub fn feature_not_supported<S: Into<String>>(feature: S) -> Self {
        Self::FeatureNotSupported {
            feature: feature.into(),
        }
    }

    /// Create an internal error
    pub fn internal<S: Into<String>>(message: S) -> Self {
        Self::Internal {
            message: message.into(),
        }
    }

    /// Create a custom error
    pub fn custom<S: Into<String>>(message: S) -> Self {
        Self::Custom {
            message: message.into(),
        }
    }

    /// Check if this error is retryable
    pub fn is_retryable(&self) -> bool {
        match self {
            Self::SolanaClient(client_error) => match &client_error.kind {
                ClientErrorKind::Io(_) | ClientErrorKind::Reqwest(_) => true,
                ClientErrorKind::RpcError(rpc_error) => match rpc_error {
                    RpcError::RpcRequestError(_) => true,
                    RpcError::RpcResponseError { .. } => false,
                    RpcError::ParseError(_) => false,
                    RpcError::ForUser(_) => false,
                },
                _ => false,
            },
            Self::Http(_) => true,
            Self::Network { .. } => true,
            Self::TransactionTimeout { .. } => true,
            Self::TransactionFailed { retryable, .. } => *retryable,
            Self::SimulationFailed { .. } => false, // Don't retry simulation failures
            Self::Timeout { .. } => true,
            Self::PriorityFeeEstimationFailed { .. } => true,
            Self::RateLimitExceeded { .. } => true, // Can retry after backoff
            _ => false,
        }
    }

    /// Get error severity level
    pub fn severity(&self) -> ErrorSeverity {
        match self {
            Self::SolanaClient(_)
            | Self::SolanaProgram(_)
            | Self::Http(_)
            | Self::Network { .. }
            | Self::TransactionTimeout { .. } => ErrorSeverity::Warning,

            Self::AccountNotFound { .. }
            | Self::InvalidAccountData { .. }
            | Self::InsufficientBalance { .. }
            | Self::RateLimitExceeded { .. }
            | Self::InvalidInput { .. } => ErrorSeverity::Error,

            Self::Configuration { .. }
            | Self::Serialization(_)
            | Self::BorshSerialization(_)
            | Self::Cryptography { .. }
            | Self::Internal { .. } => ErrorSeverity::Critical,

            Self::InvalidPubkey(_)
            | Self::Agent { .. }
            | Self::Channel { .. }
            | Self::Message { .. }
            | Self::Escrow { .. }
            | Self::Marketplace { .. }
            | Self::TransactionSimulationFailed { .. }
            | Self::FeatureNotSupported { .. }
            | Self::Custom { .. } => ErrorSeverity::Info,
            
            Self::TransactionFailed { .. } => ErrorSeverity::Error,
            Self::SimulationFailed { .. } => ErrorSeverity::Warning,
            Self::MissingPayer => ErrorSeverity::Error,
            Self::AccountSizeMismatch { .. } => ErrorSeverity::Error,
            Self::InvalidAccountDiscriminator { .. } => ErrorSeverity::Error,
            Self::Timeout { .. } => ErrorSeverity::Warning,
            Self::SplToken2022 { .. } => ErrorSeverity::Error,
            Self::PriorityFeeEstimationFailed { .. } => ErrorSeverity::Warning,
            Self::InstructionBuildingFailed { .. } => ErrorSeverity::Error,
        }
    }
}

/// Error severity levels for logging and handling
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ErrorSeverity {
    /// Informational errors that don't require immediate action
    Info,
    /// Warning errors that should be logged but don't break functionality
    Warning,
    /// Error conditions that prevent operation completion
    Error,
    /// Critical errors that require immediate attention
    Critical,
}

impl ErrorSeverity {
    /// Get the string representation of the severity level
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Info => "INFO",
            Self::Warning => "WARNING",
            Self::Error => "ERROR",
            Self::Critical => "CRITICAL",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_creation() {
        let error = PodAIError::agent("Test agent error");
        match error {
            PodAIError::Agent { message } => assert_eq!(message, "Test agent error"),
            _ => {
                assert!(false, "Expected Agent error, got: {:?}", error);
            }
        }
    }

    #[test]
    fn test_error_severity() {
        let error = PodAIError::internal("Critical issue");
        assert_eq!(error.severity(), ErrorSeverity::Critical);

        let error = PodAIError::network("Connection timeout");
        assert_eq!(error.severity(), ErrorSeverity::Warning);
    }

    #[test]
    fn test_retryable_errors() {
        let error = PodAIError::network("Timeout");
        assert!(error.is_retryable());

        let error = PodAIError::invalid_input("field", "reason");
        assert!(!error.is_retryable());
    }

    #[test]
    fn test_severity_string() {
        assert_eq!(ErrorSeverity::Critical.as_str(), "CRITICAL");
        assert_eq!(ErrorSeverity::Warning.as_str(), "WARNING");
    }
} 