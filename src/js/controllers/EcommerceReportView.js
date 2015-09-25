dataViewerControllers.controller('EcommerceReportViewController', ['$scope', '$location', 'WebServicesService', function($scope, $location, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $scope.orders = [];
  
  var addOrder = function(order) {
    $scope.orders.push(order);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }, 
  
  getOrders = function(options) {
    var settings = $.extend({
      page: '1'
    }, options || {}), 
    
    now = new Date(), 
    oneDayAgo = new Date(now - (24 * 60 * 60 * 1000)).toISOString().split('.')[0] + '+00:00';
    
    WebServicesService.query({
      statement: 'select TransactionId, Payment.Amount, Payment.PaymentDate, Purchaser.ConsName, Purchaser.PrimaryEmail from ProductOrder where Payment.PaymentDate >= ' + oneDayAgo, 
      error: function() {
        /* TODO */
      }, 
      success: function(response) {
        var $faultstring = $(response).find('faultstring');
        
        if($faultstring.length > 0) {
          /* TODO */
        }
        else {
          var $records = $(response).find('Record');
          
          if($records.length === 0) {
            /* TODO */
          }
          else {
            $records.each(function() {
              var transactionId = $(this).find('TransactionId').text(), 
              $payment = $(this).find('Payment'), 
              paymentAmount = $payment.find('Amount').text(), 
              paymentDate = $payment.find('PaymentDate').text(), 
              $purchaser = $(this).find('Purchaser'), 
              $purchaserName = $purchaser.find('ConsName'), 
              purchaserFirstName = $purchaserName.find('FirstName').text(), 
              purchaserLastName = $purchaserName.find('LastName').text(), 
              purchaserPrimaryEmail = $purchaser.find('PrimaryEmail').text();
              
              addOrder({
                'TransactionId': transactionId, 
                'Payment': {
                  'Amount': paymentAmount, 
                  'PaymentDate': paymentDate, 
                  '_PaymentDateFormatted': new Intl.DateTimeFormat().format(new Date(paymentDate))
                }, 
                'Purchaser': {
                  'ConsName': {
                    'FirstName': purchaserFirstName, 
                    'LastName': purchaserLastName
                  }, 
                  'PrimaryEmail': purchaserPrimaryEmail
                }
              });
            });
          }
          
          if($records.length === 200) {
            getOrders({
              page: '' + (Number(settings.page) + 1)
            });
          }
          else {
            $('.report-table').DataTable({
              'paging': true, /* TODO: only paginate if there are more results than one page */
              'lengthChange': false, 
              'searching': false, 
              'ordering': true, 
              'order': [
                [4, 'desc']
              ], 
              'info': true, 
              'autoWidth': false
            });
            
            $('.content .js--loading-overlay').addClass('hidden');
          }
        }
      }
    });
  };
  
  getOrders();
}]);